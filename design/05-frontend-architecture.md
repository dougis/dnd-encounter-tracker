# Frontend Architecture

## React 18 + TypeScript Architecture

The frontend follows a feature-based architecture with clear separation of concerns, leveraging modern React patterns and TypeScript for type safety.

## Technology Stack

### Core Technologies
- **React 18**: Latest React with concurrent features
- **TypeScript 5.0**: Full type safety across the application
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first CSS framework with custom design system

### State Management
- **Zustand**: Lightweight state management for client state
- **React Query (TanStack Query)**: Server state management and caching
- **React Hook Form**: Form state management with validation

### Additional Libraries
- **React Router v6**: Client-side routing
- **Socket.IO Client**: Real-time communication
- **Lucide React**: Icon library
- **Recharts**: Data visualization for analytics
- **Zod**: Runtime type validation

## Component Architecture

### Component Hierarchy
```
App
├── Layout
│   ├── Header
│   │   ├── Navigation
│   │   ├── UserMenu
│   │   └── SubscriptionStatus
│   ├── Sidebar (collapsible)
│   └── Main Content Area
├── AuthGuard
├── SubscriptionGuard
└── Feature Routes
```

### Component Categories

#### 1. UI Components (`/src/components/ui`)
Base components following design system principles.

```typescript
// Button component with variants
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'danger' | 'ghost';
  size: 'sm' | 'md' | 'lg';
  loading?: boolean;
  disabled?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
}

// Input component with validation states
interface InputProps {
  label?: string;
  error?: string;
  type: 'text' | 'email' | 'password' | 'number';
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
}
```

#### 2. Layout Components (`/src/components/layout`)
Structural components for app layout.

```typescript
// Header component
const Header: React.FC = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Navigation />
        <SubscriptionBadge tier={subscription.tier} />
        <UserMenu user={user} />
      </div>
    </header>
  );
};
```

#### 3. Form Components (`/src/components/forms`)
Reusable form components with validation.

```typescript
// Character creation form
const CharacterForm: React.FC<CharacterFormProps> = ({
  initialData,
  onSubmit,
  onCancel
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch
  } = useForm<CharacterFormData>({
    defaultValues: initialData,
    resolver: zodResolver(characterSchema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Input
        label="Character Name"
        {...register('name')}
        error={errors.name?.message}
        required
      />
      {/* Additional form fields */}
    </form>
  );
};
```

## Feature-Based Architecture

### Authentication Feature (`/src/features/auth`)
```typescript
// Auth store
interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
}

// Auth hook
const useAuth = () => {
  const authStore = useAuthStore();
  const navigate = useNavigate();
  
  const login = async (credentials: LoginCredentials) => {
    try {
      const response = await authService.login(credentials);
      authStore.setUser(response.user);
      authStore.setTokens(response.tokens);
      navigate('/dashboard');
    } catch (error) {
      throw new Error('Login failed');
    }
  };
  
  return { ...authStore, login };
};
```

### Party Management Feature (`/src/features/parties`)
```typescript
// Party list component
const PartyList: React.FC = () => {
  const { data: parties, isLoading, error } = useQuery({
    queryKey: ['parties'],
    queryFn: partyService.getParties
  });
  
  const createPartyMutation = useMutation({
    mutationFn: partyService.createParty,
    onSuccess: () => {
      queryClient.invalidateQueries(['parties']);
    }
  });
  
  if (isLoading) return <LoadingSpinner />;
  if (error) return <ErrorMessage error={error} />;
  
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Your Parties</h1>
        <Button onClick={() => setShowCreateModal(true)}>
          Create Party
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {parties?.map(party => (
          <PartyCard key={party.id} party={party} />
        ))}
      </div>
    </div>
  );
};
```

### Encounter Management Feature (`/src/features/encounters`)
```typescript
// Encounter tracker component
const EncounterTracker: React.FC<{ encounterId: string }> = ({ encounterId }) => {
  const { data: encounter } = useQuery({
    queryKey: ['encounter', encounterId],
    queryFn: () => encounterService.getEncounter(encounterId)
  });
  
  const { socket } = useSocket();
  const [participants, setParticipants] = useState(encounter?.participants || []);
  
  useEffect(() => {
    socket?.emit('join_encounter', { encounterId });
    
    socket?.on('participant_hp_changed', (data) => {
      setParticipants(prev => 
        prev.map(p => p.id === data.participantId 
          ? { ...p, currentHP: data.newHP }
          : p
        )
      );
    });
    
    return () => {
      socket?.emit('leave_encounter', { encounterId });
    };
  }, [socket, encounterId]);
  
  return (
    <div className="encounter-tracker">
      <EncounterHeader encounter={encounter} />
      <InitiativeTracker participants={participants} />
      <CombatControls encounterId={encounterId} />
    </div>
  );
};
```

## State Management Strategy

### Zustand Stores

#### Auth Store
```typescript
interface AuthStore {
  user: User | null;
  tokens: AuthTokens | null;
  isAuthenticated: boolean;
  
  setUser: (user: User) => void;
  setTokens: (tokens: AuthTokens) => void;
  clearAuth: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  tokens: null,
  isAuthenticated: false,
  
  setUser: (user) => set({ user, isAuthenticated: true }),
  setTokens: (tokens) => set({ tokens }),
  clearAuth: () => set({ user: null, tokens: null, isAuthenticated: false }),
  updateUser: (updates) => set((state) => ({
    user: state.user ? { ...state.user, ...updates } : null
  }))
}));
```

#### UI Store
```typescript
interface UIStore {
  sidebarOpen: boolean;
  theme: 'light' | 'dark' | 'auto';
  notifications: Notification[];
  
  toggleSidebar: () => void;
  setTheme: (theme: 'light' | 'dark' | 'auto') => void;
  addNotification: (notification: Notification) => void;
  removeNotification: (id: string) => void;
}
```

### React Query Configuration
```typescript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      cacheTime: 10 * 60 * 1000, // 10 minutes
      retry: (failureCount, error) => {
        if (error.status === 401) return false;
        return failureCount < 3;
      }
    },
    mutations: {
      onError: (error) => {
        if (error.status === 401) {
          useAuthStore.getState().clearAuth();
        }
      }
    }
  }
});
```

## Custom Hooks

### Authentication Hook
```typescript
const useAuth = () => {
  const authStore = useAuthStore();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      authStore.setUser(data.user);
      authStore.setTokens(data.tokens);
      localStorage.setItem('refreshToken', data.tokens.refreshToken);
      navigate('/dashboard');
    },
    onError: (error) => {
      throw new Error(error.message || 'Login failed');
    }
  });
  
  const logout = useCallback(() => {
    authStore.clearAuth();
    localStorage.removeItem('refreshToken');
    queryClient.clear();
    navigate('/login');
  }, [authStore, queryClient, navigate]);
  
  return {
    ...authStore,
    login: loginMutation.mutate,
    logout,
    isLoggingIn: loginMutation.isLoading
  };
};
```

### Subscription Hook
```typescript
const useSubscription = () => {
  const { user } = useAuth();
  
  const { data: subscription } = useQuery({
    queryKey: ['subscription', user?.id],
    queryFn: subscriptionService.getCurrentSubscription,
    enabled: !!user,
    staleTime: 10 * 60 * 1000 // 10 minutes
  });
  
  const canAccess = useCallback((feature: string) => {
    if (user?.isAdmin) return true; // Admin override
    return subscription?.features[feature] || false;
  }, [user?.isAdmin, subscription?.features]);
  
  const isAtLimit = useCallback((resource: string, current: number) => {
    if (user?.isAdmin) return false; // Admin override
    const limit = subscription?.features[`max${resource}`];
    return limit !== -1 && current >= limit;
  }, [user?.isAdmin, subscription?.features]);
  
  return {
    subscription,
    canAccess,
    isAtLimit,
    isPremium: subscription?.tier !== 'free'
  };
};
```

### Socket Hook
```typescript
const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const { tokens } = useAuth();
  
  useEffect(() => {
    if (!tokens?.accessToken) return;
    
    const newSocket = io(import.meta.env.VITE_SOCKET_URL, {
      auth: { token: tokens.accessToken }
    });
    
    newSocket.on('connect', () => {
      console.log('Connected to server');
    });
    
    newSocket.on('disconnect', () => {
      console.log('Disconnected from server');
    });
    
    setSocket(newSocket);
    
    return () => {
      newSocket.close();
    };
  }, [tokens?.accessToken]);
  
  return { socket };
};
```

## Routing Architecture

### Route Protection
```typescript
// Auth guard component
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();
  
  if (isLoading) {
    return <LoadingSpinner />;
  }
  
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  
  return <>{children}</>;
};

// Subscription guard component
const SubscriptionGuard: React.FC<{
  feature: string;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}> = ({ feature, fallback, children }) => {
  const { canAccess } = useSubscription();
  
  if (!canAccess(feature)) {
    return fallback || <UpgradePrompt feature={feature} />;
  }
  
  return <>{children}</>;
};
```

### Router Configuration
```typescript
const AppRouter: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        
        {/* Protected routes */}
        <Route path="/" element={<AuthGuard><Layout /></AuthGuard>}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<DashboardPage />} />
          
          {/* Party management */}
          <Route path="parties" element={<PartiesPage />} />
          <Route path="parties/:partyId" element={<PartyDetailPage />} />
          
          {/* Encounter management */}
          <Route path="encounters" element={<EncountersPage />} />
          <Route path="encounters/:encounterId" element={<EncounterPage />} />
          
          {/* Creature management */}
          <Route path="creatures" element={<CreaturesPage />} />
          
          {/* Subscription management */}
          <Route path="subscription" element={<SubscriptionPage />} />
          
          {/* Premium features with subscription guard */}
          <Route 
            path="analytics" 
            element={
              <SubscriptionGuard feature="advancedAnalytics">
                <AnalyticsPage />
              </SubscriptionGuard>
            } 
          />
          
          {/* Admin routes */}
          <Route 
            path="admin/*" 
            element={
              <AdminGuard>
                <AdminRoutes />
              </AdminGuard>
            } 
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
```

## Form Management

### Form Validation with Zod
```typescript
// Character schema
const characterSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50, 'Name too long'),
  ac: z.number().min(1, 'AC must be at least 1').max(30, 'AC cannot exceed 30'),
  maxHP: z.number().min(1, 'HP must be at least 1'),
  currentHP: z.number().min(0, 'Current HP cannot be negative'),
  dexterity: z.number().min(1, 'Dexterity must be at least 1').max(30, 'Dexterity cannot exceed 30'),
  classes: z.array(z.object({
    className: z.string().min(1, 'Class name required'),
    level: z.number().min(1, 'Level must be at least 1').max(20, 'Level cannot exceed 20')
  })).min(1, 'At least one class required'),
  race: z.string().min(1, 'Race is required'),
  subrace: z.string().optional(),
  playerName: z.string().optional(),
  notes: z.string().optional()
}).refine(data => data.currentHP <= data.maxHP, {
  message: 'Current HP cannot exceed max HP',
  path: ['currentHP']
});

// Form component
const CharacterForm: React.FC<CharacterFormProps> = ({ onSubmit, initialData }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    control,
    watch
  } = useForm<CharacterFormData>({
    resolver: zodResolver(characterSchema),
    defaultValues: initialData
  });
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: 'classes'
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input
          label="Character Name"
          {...register('name')}
          error={errors.name?.message}
          required
        />
        <Input
          label="Player Name"
          {...register('playerName')}
          error={errors.playerName?.message}
        />
      </div>
      
      {/* Dynamic class fields */}
      <div className="space-y-2">
        <label className="block text-sm font-medium">Classes</label>
        {fields.map((field, index) => (
          <div key={field.id} className="flex gap-2">
            <Input
              {...register(`classes.${index}.className`)}
              placeholder="Class name"
              error={errors.classes?.[index]?.className?.message}
            />
            <Input
              type="number"
              {...register(`classes.${index}.level`, { valueAsNumber: true })}
              placeholder="Level"
              error={errors.classes?.[index]?.level?.message}
            />
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={() => remove(index)}
            >
              Remove
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={() => append({ className: '', level: 1 })}
        >
          Add Class
        </Button>
      </div>
      
      <div className="flex justify-end space-x-2">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" loading={isSubmitting}>
          Save Character
        </Button>
      </div>
    </form>
  );
};
```

## Real-time Features

### Encounter Synchronization
```typescript
const EncounterSync: React.FC<{ encounterId: string }> = ({ encounterId }) => {
  const { socket } = useSocket();
  const queryClient = useQueryClient();
  
  useEffect(() => {
    if (!socket) return;
    
    // Join encounter room
    socket.emit('join_encounter', { encounterId });
    
    // Handle real-time updates
    socket.on('participant_updated', (data) => {
      queryClient.setQueryData(['encounter', encounterId], (old: any) => {
        if (!old) return old;
        
        return {
          ...old,
          participants: old.participants.map((p: any) =>
            p.id === data.participantId ? { ...p, ...data.updates } : p
          )
        };
      });
    });
    
    socket.on('turn_advanced', (data) => {
      queryClient.setQueryData(['encounter', encounterId], (old: any) => {
        if (!old) return old;
        return { ...old, currentTurn: data.currentTurn, round: data.round };
      });
    });
    
    socket.on('encounter_status_changed', (data) => {
      queryClient.invalidateQueries(['encounter', encounterId]);
    });
    
    return () => {
      socket.emit('leave_encounter', { encounterId });
      socket.off('participant_updated');
      socket.off('turn_advanced');
      socket.off('encounter_status_changed');
    };
  }, [socket, encounterId, queryClient]);
  
  return null; // This component only handles synchronization
};
```

## Performance Optimization

### Component Memoization
```typescript
// Memoized participant component
const ParticipantCard = React.memo<ParticipantCardProps>(({ 
  participant, 
  isCurrentTurn, 
  onHPChange, 
  onAddCondition 
}) => {
  const handleHPChange = useCallback((newHP: number) => {
    onHPChange(participant.id, newHP);
  }, [participant.id, onHPChange]);
  
  return (
    <div className={`participant-card ${isCurrentTurn ? 'current-turn' : ''}`}>
      <ParticipantHeader participant={participant} />
      <HPTracker 
        currentHP={participant.currentHP}
        maxHP={participant.maxHP}
        onChange={handleHPChange}
      />
      <ConditionList conditions={participant.conditions} />
    </div>
  );
});
```

### Code Splitting
```typescript
// Lazy load components
const AdminDashboard = lazy(() => import('../features/admin/AdminDashboard'));
const AdvancedAnalytics = lazy(() => import('../features/analytics/AdvancedAnalytics'));

// Use with Suspense
<Suspense fallback={<LoadingSpinner />}>
  <AdminDashboard />
</Suspense>
```

### Virtual Scrolling for Large Lists
```typescript
// For large creature/encounter lists
const VirtualizedCreatureList: React.FC<{ creatures: Creature[] }> = ({ creatures }) => {
  const Row = ({ index, style }: { index: number; style: any }) => (
    <div style={style}>
      <CreatureCard creature={creatures[index]} />
    </div>
  );
  
  return (
    <FixedSizeList
      height={600}
      itemCount={creatures.length}
      itemSize={120}
    >
      {Row}
    </FixedSizeList>
  );
};
```

## Error Handling

### Error Boundary
```typescript
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    // Send to error reporting service
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    
    return this.props.children;
  }
}
```

### Global Error Handler
```typescript
const useErrorHandler = () => {
  const { addNotification } = useUIStore();
  
  return useCallback((error: Error, context?: string) => {
    console.error(`Error in ${context}:`, error);
    
    addNotification({
      type: 'error',
      title: 'Something went wrong',
      message: error.message || 'An unexpected error occurred',
      duration: 5000
    });
  }, [addNotification]);
};
```

This frontend architecture provides a scalable, maintainable, and type-safe foundation for the D&D Encounter Tracker, with proper separation of concerns, real-time capabilities, and comprehensive error handling.