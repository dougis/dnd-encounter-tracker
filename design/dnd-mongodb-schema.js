const characterSchema = new Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['player', 'npc'], required: true },
  race: { type: String },
  dexterity: { type: Number, required: true },
  armorClass: { type: Number, required: true },
  maxHP: { type: Number, required: true },
  currentHP: { type: Number, required: true },
  classes: [{
    class: { type: String },
    level: { type: Number }
  }],
  initiativeModifier: { type: Number },
  legendaryActions: {
    maxPerRound: { type: Number },
    remaining: { type: Number },
    actions: [{
      name: { type: String },
      description: { type: String }
    }]
  }
});

const partySchema = new Schema({
  name: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'Character' }],
  createdAt: { type: Date, default: Date.now }
});

const encounterSchema = new Schema({
  name: { type: String, required: true },
  participants: [{
    character: { type: Schema.Types.ObjectId, ref: 'Character' },
    initiativeRoll: { type: Number, required: true },
    dexteritySnapshot: { type: Number },
    type: { type: String, enum: ['player', 'npc'], required: true }
  }],
  round: { type: Number, default: 1 },
  turnIndex: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});
