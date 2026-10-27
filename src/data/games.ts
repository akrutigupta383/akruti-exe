export interface Game {
  id: string;
  /** Fixed wheel number (1–20). Never editable. */
  number: number;
  /** Fixed game name. Never editable. */
  name: string;
  instructions: string;
  duration: string;
  materials: string;
}

/** The fields a host may edit from the settings panel. */
export type EditableGameField = 'instructions' | 'duration' | 'materials';

/**
 * The single source of truth for the number-to-game mapping.
 * Order matters only for readability — lookups always go through `number`.
 */
export const DEFAULT_GAMES: readonly Game[] = Object.freeze([
  {
    id: 'laugh-like-a-villain',
    number: 1,
    name: 'Laugh Like a Villain',
    instructions:
      'Deliver a dramatic Bollywood villain laugh for 10 seconds. Add facial expressions and gestures to make it more entertaining. The audience can vote for the most convincing performance.',
    duration: '20 seconds',
    materials: 'None',
  },
  {
    id: 'invisible-phone-call',
    number: 2,
    name: 'Invisible Phone Call',
    instructions:
      'Pretend to argue with someone over an imaginary phone. The host secretly gives you a situation, such as arguing with a food delivery app about a missing order or complaining to a friend who borrowed money. Act it out without revealing the situation directly while the audience guesses what happened.',
    duration: '30 seconds',
    materials: 'Prepared situation cards',
  },
  {
    id: 'reverse-talking',
    number: 3,
    name: 'Reverse Talking',
    instructions:
      'Say a simple sentence with the words in reverse order. For example, "I love eating pizza" becomes "Pizza eating love I." You get one attempt, and the audience decides whether you completed the challenge.',
    duration: '20 seconds',
    materials: 'Prepared sentence cards',
  },
  {
    id: 'news-reporter',
    number: 4,
    name: 'News Reporter',
    instructions:
      'Act like a live news reporter covering something happening in the room: students arriving late, a dramatic competition, or an imaginary breaking news story about college life. Use a serious news-anchor voice.',
    duration: '30 seconds',
    materials: 'None',
  },
  {
    id: 'dramatic-proposal',
    number: 5,
    name: 'Dramatic Proposal',
    instructions:
      'Propose to a random object, such as a water bottle, chair, or backpack, as if it were the love of your life. Deliver a dramatic romantic speech with expressions and gestures.',
    duration: '30 seconds',
    materials: 'Everyday objects',
  },
  {
    id: 'evil-laugh-challenge',
    number: 6,
    name: 'Evil Laugh Challenge',
    instructions:
      'Perform your most dramatic evil laugh, as if you were planning to take over the world. Experiment with different voices, expressions, and gestures. The audience votes for the most entertaining laugh.',
    duration: '15–20 seconds',
    materials: 'None',
  },
  {
    id: 'freeze-like-a-statue',
    number: 7,
    name: 'Freeze Like a Statue',
    instructions:
      'Strike the funniest pose you can and hold it without moving for 15 seconds. The host can suggest themes such as a shocked student, a Bollywood hero, or someone who just saw their exam results.',
    duration: '20 seconds',
    materials: 'None',
  },
  {
    id: 'angry-baby',
    number: 8,
    name: 'Angry Baby',
    instructions:
      'Act like an angry toddler complaining about college life: assignments, early morning classes, attendance, or exams. Use a childish voice and exaggerated expressions.',
    duration: '30 seconds',
    materials: 'None',
  },
  {
    id: 'dub-it',
    number: 9,
    name: 'Dub It!',
    instructions:
      'A volunteer silently performs simple actions, such as drinking water, searching for a pen, or checking their bag. Another participant provides dramatic or funny live commentary as if dubbing a movie scene. The audience votes for the funniest dubbing.',
    duration: '30–45 seconds',
    materials: 'Everyday objects',
  },
  {
    id: 'npc-challenge',
    number: 10,
    name: 'NPC Challenge',
    instructions:
      'Act like a non-player character from a video game. Repeat the same three lines and actions whenever someone interacts with you, e.g. "Welcome to college!" "The canteen is on your left." "Please try again later." Stay in character for the entire challenge.',
    duration: '30 seconds',
    materials: 'Prepared dialogue prompts (optional)',
  },
  {
    id: 'freeze-dance',
    number: 11,
    name: 'Freeze Dance',
    instructions:
      'Dance while the music plays. The moment it stops, everyone must freeze in their current position. Anyone who moves is out. Continue until one participant remains.',
    duration: '1–2 minutes',
    materials: 'Speaker and music',
  },
  {
    id: 'two-truths-and-a-lie',
    number: 12,
    name: 'Two Truths and a Lie',
    instructions:
      'Share three statements about yourself: two true and one lie. The others guess which statement is false. Bonus points for a lie that nobody guesses correctly.',
    duration: '1–2 minutes per participant',
    materials: 'None',
  },
  {
    id: 'guess-the-person',
    number: 13,
    name: 'Guess the Person',
    instructions:
      'The host gives three clues about a celebrity, fictional character, or well-known personality, starting difficult and getting easier with each clue. The first person to guess correctly wins.',
    duration: '30–45 seconds per round',
    materials: 'Prepared clue cards',
  },
  {
    id: 'accent-challenge',
    number: 14,
    name: 'Accent Challenge',
    instructions:
      'Say a simple sentence in a randomly assigned accent or speaking style, e.g. "I am going to be late for class today" in a dramatic Bollywood style. The audience votes for the funniest or most entertaining performance.',
    duration: '30 seconds per participant',
    materials: 'Prepared sentences and accent or style cards',
  },
  {
    id: 'finish-the-sentence',
    number: 15,
    name: 'Finish the Sentence',
    instructions:
      'The host gives an incomplete, funny sentence to finish creatively, e.g. "My college would be better if..." or "If I became famous tomorrow, I would..." The funniest or most unexpected answer wins.',
    duration: '30 seconds per participant',
    materials: 'Prepared sentence prompts',
  },
  {
    id: 'balloon-keep-up',
    number: 16,
    name: 'Balloon Keep-Up',
    instructions:
      'Keep a balloon in the air without letting it touch the ground. Use your hands or other body parts, but you cannot hold or trap the balloon. Whoever keeps it airborne the longest wins.',
    duration: '30–60 seconds per round',
    materials: 'Balloons',
  },
  {
    id: 'random-talent-show',
    number: 17,
    name: 'Random Talent Show',
    instructions:
      'Showcase a fun or unusual talent. If you cannot think of one, the host gives you a random challenge, such as mimicking a cartoon character, delivering a dramatic dialogue, or doing a funny dance. The audience chooses the most entertaining performance.',
    duration: '30–60 seconds per participant',
    materials: 'None',
  },
  {
    id: 'category-countdown',
    number: 18,
    name: 'Category Countdown',
    instructions:
      'The host announces a category, such as Bollywood movies, food items, brands, celebrities, or college essentials. Take turns naming something in the category without repeating an earlier answer. Anyone who cannot answer within three seconds is out. The last participant remaining wins.',
    duration: '1–2 minutes per round',
    materials: 'Category prompt cards or a timer',
  },
  {
    id: 'random-pair-challenge',
    number: 19,
    name: 'The Random Pair Challenge',
    instructions:
      'Pair two students who do not know each other well. In 60 seconds they discover three things they have in common, such as favourite food, hobbies, music, or travel interests. Then they introduce each other to the group and share what they found.',
    duration: '2 minutes per round',
    materials: 'None',
  },
  {
    id: 'meme-caption-contest',
    number: 20,
    name: 'Meme Caption Contest',
    instructions:
      'Suggest the funniest caption for a college-related image within 20 seconds. Let the audience vote.',
    duration: '30 seconds',
    materials: 'Prepared images',
  },
].map((game) => Object.freeze(game)));

export function cloneDefaultGames(): Game[] {
  return DEFAULT_GAMES.map((game) => ({ ...game }));
}

/**
 * Rebuilds the game list from stored host edits. The id, number and name always
 * come from DEFAULT_GAMES so the mapping can never drift.
 */
export function mergeStoredGames(stored: unknown): Game[] {
  const edits = new Map<number, Partial<Record<EditableGameField, unknown>>>();
  if (Array.isArray(stored)) {
    for (const item of stored) {
      if (item && typeof item === 'object' && typeof (item as Game).number === 'number') {
        edits.set((item as Game).number, item as Partial<Record<EditableGameField, unknown>>);
      }
    }
  }
  return DEFAULT_GAMES.map((game) => {
    const edit = edits.get(game.number);
    const pick = (field: EditableGameField) =>
      typeof edit?.[field] === 'string' ? (edit[field] as string) : game[field];
    return {
      ...game,
      instructions: pick('instructions'),
      duration: pick('duration'),
      materials: pick('materials'),
    };
  });
}
