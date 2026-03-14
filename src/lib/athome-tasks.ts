// RoboCup@Home 2026 — Task definitions
// All point values are EXACT from the official rulebook. Do NOT modify.

export type ItemType = "checkbox" | "stepper";

export interface TaskItem {
  key: string;
  label: string;
  type: ItemType;
  points: number; // points per unit (negative = penalty)
  max?: number;   // max count for steppers
}

export interface TaskSection {
  title: string;
  items: TaskItem[];
}

export interface TaskDefinition {
  id: string;
  name: string;
  maxScore: number;
  timeLimit: string; // e.g. "6:00"
  sections: TaskSection[];
}

export interface InspectionItem {
  key: string;
  label: string;
}

export interface InspectionSection {
  title: string;
  items: InspectionItem[];
}

// ─── Inspection ─────────────────────────────────────────────────────────────

export const INSPECTION_SECTIONS: InspectionSection[] = [
  {
    title: "Appearance & Safety",
    items: [
      { key: "cover", label: "Cover: All internal hardware fully enclosed" },
      { key: "appearance", label: "Appearance: Product-like finished appearance" },
      { key: "loose_cables", label: "No loose cables hanging from the robot" },
      { key: "safety", label: "No sharp edges or protruding parts" },
      { key: "annoyance", label: "No continuous loud noises or blinding lights" },
      { key: "marks", label: "No artificial marks or patterns" },
      { key: "driving", label: "Obstacle avoidance active and functional" },
    ],
  },
  {
    title: "Inspection Checked Aspects",
    items: [
      { key: "emergency_button", label: "Emergency button: present, red, accessible" },
      { key: "collision_avoidance", label: "Collision avoidance: robot stops when TC steps in front" },
      { key: "voice", label: "Voice: loud and clear" },
      { key: "custom_containers", label: "Custom containers approved" },
      { key: "external_devices", label: "External devices declared and approved" },
      { key: "alt_hri", label: "Alternative HRI approved if used" },
      { key: "speed_dimensions", label: "Fits within 200cm × 70cm door, safe speed" },
      { key: "start_signal", label: "Manual start signal approved by TC" },
      { key: "speaker_system", label: "Speaker system / RF plug checked" },
      { key: "safety_issues", label: "No duct tape, hanging cables, or sharp edges" },
    ],
  },
];

export const ALL_INSPECTION_KEYS = INSPECTION_SECTIONS.flatMap((s) =>
  s.items.map((i) => i.key),
);

// ─── Scored Tasks ───────────────────────────────────────────────────────────

export const TASKS: TaskDefinition[] = [
  // ── HRI ──────────────────────────────────────────────────────
  {
    id: "hri",
    name: "Human Robot Interaction",
    maxScore: 1450,
    timeLimit: "6:00",
    sections: [
      {
        title: "Main Goal",
        items: [
          { key: "offer_seat", label: "Offer a free seat to the new guest", type: "stepper", points: 100, max: 2 },
          { key: "look_navigation", label: "Look in the direction of navigation or at the navigation goal", type: "stepper", points: 15, max: 2 },
          { key: "look_person", label: "Look at the person talking, when receiving a guest", type: "stepper", points: 50, max: 2 },
          { key: "say_name_drink", label: "Say name and favorite drink of each guest (during introduction)", type: "stepper", points: 30, max: 4 },
          { key: "look_correct_guest", label: "While introducing guests, look to the correct guest while talking about the other guest", type: "stepper", points: 50, max: 2 },
        ],
      },
      {
        title: "Extra Rewards",
        items: [
          { key: "detect_doorbell", label: "Detect the doorbell sound as a signal that a guest has arrived", type: "stepper", points: 30, max: 2 },
          { key: "open_door", label: "Open the entrance door for a guest", type: "stepper", points: 200, max: 2 },
          { key: "correct_attribute", label: "Tell a visual attribute — Correct attribute", type: "stepper", points: 20, max: 4 },
          { key: "incorrect_attribute", label: "Tell a visual attribute — Incorrect attribute", type: "stepper", points: -20, max: 4 },
          { key: "no_nonessential_q", label: "Not asking non essential questions to confirm or correct information", type: "stepper", points: 15, max: 4 },
        ],
      },
      {
        title: "Guiding",
        items: [
          { key: "grab_bag", label: "Grab the bag via natural handover from the guest", type: "checkbox", points: 50 },
          { key: "follow_host", label: "Following the host to the bag drop area", type: "checkbox", points: 200 },
          { key: "drop_bag_following", label: "Drop the bag while following the host", type: "checkbox", points: -50 },
          { key: "rediscover_operator", label: "Rediscovering the operator by natural interaction", type: "checkbox", points: -50 },
          { key: "ask_operator_wait", label: "Asking the operator to wait", type: "checkbox", points: -50 },
          { key: "physical_contact", label: "Guiding the robot with physical contact (take by the hand)", type: "checkbox", points: -150 },
          { key: "drop_bag_correct", label: "Drop the bag in the correct area", type: "checkbox", points: 50 },
        ],
      },
      {
        title: "Penalties",
        items: [
          { key: "wrong_guest_info", label: "Wrong guest information was memorized", type: "stepper", points: -40, max: 4 },
          { key: "alt_hri", label: "Alternative HRI", type: "stepper", points: -20, max: 6 },
          { key: "not_recognizing", label: "Not recognizing people", type: "stepper", points: -200, max: 2 },
          { key: "ask_place_bag", label: "Ask the guest to place the bag somewhere on the robot", type: "checkbox", points: -25 },
        ],
      },
      {
        title: "Special Penalties & Bonuses",
        items: [
          { key: "not_attending", label: "Not attending (see sec. 3.8.1)", type: "checkbox", points: -500 },
          { key: "outstanding", label: "Outstanding performance (see sec. 3.8.3)", type: "checkbox", points: 145 },
        ],
      },
    ],
  },

  // ── Pick and Place ───────────────────────────────────────────
  {
    id: "pick_place",
    name: "Pick and Place",
    maxScore: 3515,
    timeLimit: "7:00",
    sections: [
      {
        title: "Navigation & Perception",
        items: [
          { key: "navigate_table", label: "Navigate to the table", type: "checkbox", points: 15 },
          { key: "recognize_object", label: "Correctly recognize an object", type: "stepper", points: 10, max: 12 },
          { key: "perceive_shelf", label: "Perceive objects on a shelf and indicate the correct placement", type: "stepper", points: 30, max: 2 },
        ],
      },
      {
        title: "Picking",
        items: [
          { key: "pick_object", label: "Picking up an object for transportation", type: "stepper", points: 50, max: 12 },
          { key: "first_pick_bonus", label: "First Pick Bonus", type: "checkbox", points: 100 },
          { key: "from_floor", label: "From the floor", type: "checkbox", points: 30 },
          { key: "cutlery", label: "Cutlery", type: "stepper", points: 50, max: 2 },
          { key: "plate", label: "Plate", type: "checkbox", points: 100 },
          { key: "dishwasher_tab_pick", label: "Dishwasher tab", type: "checkbox", points: 100 },
          { key: "common_obj_pick", label: "Common object from auxiliary table (picking penalty)", type: "stepper", points: -20, max: 2 },
        ],
      },
      {
        title: "Placing",
        items: [
          { key: "place_object", label: "Place an object in its designated location", type: "stepper", points: 40, max: 12 },
          { key: "correctly_dishwasher", label: "Correctly in the dishwasher", type: "stepper", points: 70, max: 3 },
          { key: "similar_cabinet", label: "Next to similar objects in the cabinet", type: "stepper", points: 20, max: 2 },
          { key: "breakfast_not_clean", label: "Area around breakfast items is not cleaned", type: "stepper", points: -30, max: 4 },
          { key: "dishwasher_tab_slot", label: "In the dishwasher tab slot inside the dishwasher", type: "checkbox", points: 160 },
          { key: "common_obj_place", label: "Common object from auxiliary table (placing penalty)", type: "stepper", points: -20, max: 2 },
        ],
      },
      {
        title: "Extra Rewards",
        items: [
          { key: "pull_push_rack", label: "Pull or push the dishwasher rack", type: "stepper", points: 100, max: 2 },
          { key: "open_close_door", label: "Open or close the dishwasher door without assistance", type: "stepper", points: 200, max: 2 },
          { key: "open_milk", label: "Open milk container without assistance", type: "checkbox", points: 400 },
          { key: "pour_cereal_milk", label: "Pour cereal or milk into the bowl without assistance", type: "stepper", points: 200, max: 2 },
        ],
      },
      {
        title: "Penalties",
        items: [
          { key: "thrown_dropped", label: "Objects thrown or dropped while placing", type: "stepper", points: -40, max: 12 },
          { key: "breakfast_not_typical", label: "Breakfast not served in a typical meal setting", type: "checkbox", points: -50 },
          { key: "dropped_floor", label: "Objects dropped on the floor", type: "stepper", points: -40, max: 12 },
          { key: "spill_pouring", label: "Spilling cereal and milk while pouring", type: "stepper", points: -100, max: 2 },
          { key: "human_reposition", label: "Human assistance: object repositioned by a person", type: "stepper", points: -30, max: 12 },
          { key: "human_handover", label: "Human assistance: handover", type: "stepper", points: -100, max: 24 },
          { key: "human_env_changes", label: "Human assistance: environment changes (per item)", type: "checkbox", points: -40 },
        ],
      },
      {
        title: "Special Penalties & Bonuses",
        items: [
          { key: "not_attending", label: "Not attending", type: "checkbox", points: -500 },
          { key: "alt_start_signal", label: "Using alternative start signal (see sec. 3.6.8)", type: "checkbox", points: -100 },
          { key: "outstanding", label: "Outstanding performance", type: "checkbox", points: 351 },
        ],
      },
    ],
  },

  // ── GPSR ──────────────────────────────────────────────────────
  {
    id: "gpsr",
    name: "General Purpose Service Robot",
    maxScore: 1490,
    timeLimit: "7:00",
    sections: [
      {
        title: "Main Goal",
        items: [
          { key: "understand_command", label: "Understand the spoken command", type: "stepper", points: 80, max: 3 },
          { key: "custom_operator", label: "Using a custom operator", type: "stepper", points: -20, max: 3 },
          { key: "request_rephrasing", label: "Request a rephrasing", type: "stepper", points: -30, max: 6 },
          { key: "demonstrate_plan", label: "Demonstrate a plan has been generated", type: "stepper", points: 100, max: 3 },
          { key: "solve_first", label: "Solving the first command", type: "checkbox", points: 250 },
          { key: "solve_second", label: "Solving the second command", type: "checkbox", points: 250 },
          { key: "solve_third", label: "Solving the third command", type: "checkbox", points: 250 },
        ],
      },
      {
        title: "Extra Rewards",
        items: [
          { key: "interleaved_bonus", label: "Interleaved Task Bonus", type: "checkbox", points: 200 },
        ],
      },
      {
        title: "Penalties",
        items: [
          { key: "bypass_speech", label: "Bypassing speech recognition", type: "stepper", points: -50, max: 3 },
        ],
      },
      {
        title: "Special Penalties & Bonuses",
        items: [
          { key: "not_attending", label: "Not attending", type: "checkbox", points: -500 },
          { key: "alt_start_signal", label: "Using alternative start signal", type: "checkbox", points: -100 },
          { key: "outstanding", label: "Outstanding performance", type: "checkbox", points: 149 },
        ],
      },
    ],
  },

  // ── Laundry ──────────────────────────────────────────────────
  {
    id: "laundry",
    name: "Doing Laundry",
    maxScore: 4415,
    timeLimit: "7:00",
    sections: [
      {
        title: "Main Goal",
        items: [
          { key: "navigate_laundry", label: "Navigating to the laundry area", type: "checkbox", points: 15 },
          { key: "pick_basket", label: "Picking up a piece of clothing from the basket", type: "checkbox", points: 100 },
          { key: "pick_multiple", label: "Picking up multiple at once", type: "checkbox", points: -100 },
          { key: "fold_clothing", label: "Folding a piece of clothing", type: "checkbox", points: 800 },
          { key: "human_flatten_main", label: "Human assistance: Flattening/Arranging clothing before folding", type: "checkbox", points: -200 },
          { key: "human_fold_main", label: "Human assistance during folding (max penalty)", type: "checkbox", points: -800 },
        ],
      },
      {
        title: "Extra Rewards",
        items: [
          { key: "open_washer", label: "Opening the washing machine door", type: "checkbox", points: 300 },
          { key: "remove_washer", label: "Removing one or more pieces of clothing from the washing machine", type: "checkbox", points: 300 },
          { key: "clothing_floor", label: "The clothing touches the floor", type: "checkbox", points: -200 },
          { key: "basket_transport", label: "Using the basket for transportation", type: "checkbox", points: 300 },
          { key: "laundry_dropped", label: "Laundry is dropped or otherwise lost during transportation", type: "checkbox", points: -200 },
          { key: "fold_additional", label: "Folding additional clothes (per item)", type: "stepper", points: 400, max: 5 },
          { key: "human_flatten_extra", label: "Human assistance: Flattening/Arranging (extra)", type: "stepper", points: -200, max: 5 },
          { key: "human_fold_extra", label: "Human assistance during folding extra (max per item)", type: "stepper", points: -400, max: 5 },
          { key: "stack_folded", label: "Stacking folded clothes neatly (per item)", type: "stepper", points: 100, max: 6 },
        ],
      },
      {
        title: "Special Penalties & Bonuses",
        items: [
          { key: "not_attending", label: "Not attending", type: "checkbox", points: -500 },
          { key: "alt_start_signal", label: "Using alternative start signal", type: "checkbox", points: -100 },
          { key: "outstanding", label: "Outstanding performance", type: "checkbox", points: 441 },
        ],
      },
    ],
  },

  // ── Restaurant ───────────────────────────────────────────────
  {
    id: "restaurant",
    name: "Restaurant",
    maxScore: 2400,
    timeLimit: "15:00",
    sections: [
      {
        title: "Regular Rewards",
        items: [
          { key: "detect_customer", label: "Detect calling or waving customer", type: "stepper", points: 100, max: 2 },
          { key: "reach_table", label: "Reach a customer's table", type: "stepper", points: 100, max: 2 },
          { key: "human_guided_table", label: "Human Assistance: Being guided to a table", type: "stepper", points: -100, max: 2 },
          { key: "understand_order", label: "Understand and confirm the order received to the customer", type: "stepper", points: 200, max: 2 },
          { key: "no_eye_contact", label: "Not making eye-contact when taking the order", type: "stepper", points: -80, max: 2 },
          { key: "communicate_barman", label: "Communicate the order to the barman", type: "stepper", points: 100, max: 2 },
          { key: "pick_items", label: "Picking up the requested items from the Kitchen-bar", type: "stepper", points: 200, max: 2 },
          { key: "human_barman_handover", label: "Human assistance: Asking the Barman to handover object", type: "stepper", points: -100, max: 4 },
          { key: "return_table", label: "Return to the customer table with the order", type: "stepper", points: 100, max: 2 },
          { key: "serve_order", label: "Serve the order to the customer", type: "stepper", points: 200, max: 2 },
          { key: "human_guest_take", label: "Human assistance: Guest needing to take the object from tray or robot's hand", type: "stepper", points: -100, max: 4 },
        ],
      },
      {
        title: "Extra Rewards",
        items: [
          { key: "use_tray", label: "Use an unattached tray to transport", type: "stepper", points: 200, max: 2 },
        ],
      },
      {
        title: "Penalties",
        items: [
          { key: "not_reach_bar", label: "Not reaching the bar (barman has to move)", type: "stepper", points: -80, max: 2 },
          { key: "human_direction", label: "Human Assistance: Asking for directional confirmation", type: "stepper", points: -40, max: 2 },
          { key: "human_pointed", label: "Human Assistance: Being told/pointed where a table/Kitchen-bar is", type: "stepper", points: -50, max: 2 },
        ],
      },
      {
        title: "Special Penalties & Bonuses",
        items: [
          { key: "not_attending", label: "Not attending", type: "checkbox", points: -500 },
          { key: "alt_start_signal", label: "Using alternative start signal", type: "checkbox", points: -100 },
          { key: "outstanding", label: "Outstanding performance", type: "checkbox", points: 240 },
        ],
      },
    ],
  },

  // ── Finals ───────────────────────────────────────────────────
  {
    id: "finals",
    name: "Finals",
    maxScore: 8150,
    timeLimit: "10:00",
    sections: [
      {
        title: "Main Goal",
        items: [
          { key: "find_problem", label: "Find and clearly state an encountered problem", type: "stepper", points: 150, max: 3 },
          { key: "find_repeated", label: "Find repeated problem category", type: "checkbox", points: -100 },
          { key: "human_ask_location", label: "Human Assistance: Asking for location of a problem", type: "checkbox", points: -150 },
          { key: "solve_problem", label: "Solve a problem", type: "stepper", points: 650, max: 10 },
          { key: "repeated_2nd", label: "Solving repeated problem category for the 2nd time", type: "checkbox", points: -300 },
          { key: "repeated_3rd", label: "Solving repeated problem category for the 3rd (or more) time", type: "checkbox", points: -500 },
          { key: "instruct_human", label: "Instructing a human to perform parts of the task (max penalty)", type: "checkbox", points: -650 },
        ],
      },
      {
        title: "Specific Tasks",
        items: [
          { key: "open_door", label: "Opening the Door of the Apartment", type: "checkbox", points: 600 },
          { key: "close_dishwasher", label: "Closing the Dishwasher", type: "checkbox", points: 600 },
        ],
      },
      {
        title: "Custom Tasks",
        items: [
          { key: "custom_1", label: "Custom task 1", type: "stepper", points: 1, max: 9999 },
          { key: "custom_2", label: "Custom task 2", type: "stepper", points: 1, max: 9999 },
          { key: "custom_3", label: "Custom task 3", type: "stepper", points: 1, max: 9999 },
        ],
      },
      {
        title: "Penalties",
        items: [
          { key: "restart", label: "Restart (only applies if the robot continues scoring afterwards)", type: "checkbox", points: -50 },
        ],
      },
    ],
  },
];

export const TASK_MAP = new Map(TASKS.map((t) => [t.id, t]));

/** Compute total score from scoreData for a given task */
export function computeTotal(
  taskId: string,
  scoreData: Record<string, unknown>,
): number {
  const task = TASK_MAP.get(taskId);
  if (!task) return 0;

  let total = 0;
  for (const section of task.sections) {
    for (const item of section.items) {
      // Special handling for custom tasks in finals
      if (taskId === "finals" && item.key.startsWith("custom_")) {
        const pts = scoreData[`${item.key}_points`];
        if (typeof pts === "number") total += pts;
        continue;
      }

      const val = scoreData[item.key];
      if (item.type === "checkbox") {
        if (val === true) total += item.points;
      } else {
        // stepper
        if (typeof val === "number") total += val * item.points;
      }
    }
  }
  return total;
}
