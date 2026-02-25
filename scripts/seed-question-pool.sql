-- ============================================================
-- LEADERSHIP ASSESSMENT — QUESTION POOL SEED DATA
-- 120 items: 6 dimensions x 20 items each
-- Types: 12 Likert + 5 Situational + 3 Forced Choice per dimension
-- ============================================================

-- ============================================================
-- DIMENSION 1: DRIVE
-- Measures: Ambition, energy, initiative, bias toward action
-- 12 Likert (5 reverse, 2 cross-loaded, 1 IM, 1 validity pair)
-- 5 Situational, 3 Forced Choice
-- ============================================================

-- DRIVE LIKERT (forward-scored)
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'drive_likert_01', 'drive', NULL, 'likert',
  'When a project falls behind schedule, I am usually the first person to step up and push things forward.',
  NULL,
  '{"1": {"drive": 0}, "2": {"drive": 25}, "3": {"drive": 50}, "4": {"drive": 75}, "5": {"drive": 100}}',
  0.4, false, 'drive_vp_01', false, '{quick,deep}'
),
(
  'drive_likert_02', 'drive', NULL, 'likert',
  'In the last month, I have started at least one task or initiative without being asked.',
  NULL,
  '{"1": {"drive": 0}, "2": {"drive": 25}, "3": {"drive": 50}, "4": {"drive": 75}, "5": {"drive": 100}}',
  0.35, false, NULL, false, '{quick,deep}'
),
(
  'drive_likert_03', 'drive', NULL, 'likert',
  'When I see an opportunity to improve how my team works, I act on it within days rather than waiting.',
  NULL,
  '{"1": {"drive": 0}, "2": {"drive": 25}, "3": {"drive": 50}, "4": {"drive": 75}, "5": {"drive": 100}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'drive_likert_04', 'drive', NULL, 'likert',
  'I set clear daily goals for myself even when no one is tracking my output.',
  NULL,
  '{"1": {"drive": 0}, "2": {"drive": 25}, "3": {"drive": 50}, "4": {"drive": 75}, "5": {"drive": 100}}',
  0.45, false, NULL, false, '{quick,deep}'
),
-- DRIVE LIKERT (cross-loaded: drive + resilience)
(
  'drive_likert_05', 'drive', 'resilience', 'likert',
  'When I hit a major setback on a project, I find myself working harder rather than pulling back.',
  NULL,
  '{"1": {"drive": 0, "resilience": 0}, "2": {"drive": 17.5, "resilience": 7.5}, "3": {"drive": 35, "resilience": 15}, "4": {"drive": 52.5, "resilience": 22.5}, "5": {"drive": 70, "resilience": 30}}',
  0.55, false, NULL, false, '{quick,deep}'
),
-- DRIVE LIKERT (cross-loaded: drive + vision)
(
  'drive_likert_06', 'drive', 'vision', 'likert',
  'I regularly turn big-picture ideas into concrete action steps within the same week.',
  NULL,
  '{"1": {"drive": 0, "vision": 0}, "2": {"drive": 17.5, "vision": 7.5}, "3": {"drive": 35, "vision": 15}, "4": {"drive": 52.5, "vision": 22.5}, "5": {"drive": 70, "vision": 30}}',
  0.6, false, NULL, false, '{deep}'
),
-- DRIVE LIKERT (impression management)
(
  'drive_likert_07', 'drive', NULL, 'likert',
  'I have never missed a self-imposed deadline, even when no one else was aware of it.',
  NULL,
  '{"1": {"drive": 0}, "2": {"drive": 25}, "3": {"drive": 50}, "4": {"drive": 75}, "5": {"drive": 100}}',
  0.8, false, NULL, true, '{quick,deep}'
),
-- DRIVE LIKERT (reverse-scored)
(
  'drive_likert_08', 'drive', NULL, 'likert',
  'I often wait for someone else to take charge before I get involved in a new initiative.',
  NULL,
  '{"1": {"drive": 100}, "2": {"drive": 75}, "3": {"drive": 50}, "4": {"drive": 25}, "5": {"drive": 0}}',
  0.35, true, NULL, false, '{quick,deep}'
),
(
  'drive_likert_09', 'drive', NULL, 'likert',
  'When a task feels overwhelming, I tend to put it off rather than break it into smaller steps.',
  NULL,
  '{"1": {"drive": 100}, "2": {"drive": 75}, "3": {"drive": 50}, "4": {"drive": 25}, "5": {"drive": 0}}',
  0.3, true, NULL, false, '{quick,deep}'
),
(
  'drive_likert_10', 'drive', NULL, 'likert',
  'I find it difficult to stay motivated on projects that do not have immediate visible results.',
  NULL,
  '{"1": {"drive": 100}, "2": {"drive": 75}, "3": {"drive": 50}, "4": {"drive": 25}, "5": {"drive": 0}}',
  0.5, true, NULL, false, '{quick,deep}'
),
(
  'drive_likert_11', 'drive', NULL, 'likert',
  'In the last month, there were days when I did the minimum required rather than pushing for more.',
  NULL,
  '{"1": {"drive": 100}, "2": {"drive": 75}, "3": {"drive": 50}, "4": {"drive": 25}, "5": {"drive": 0}}',
  0.3, true, NULL, false, '{deep}'
),
-- DRIVE LIKERT (validity pair partner, reverse-scored)
(
  'drive_likert_12', 'drive', NULL, 'likert',
  'When timelines are at risk, I tend to wait for direction rather than step up on my own.',
  NULL,
  '{"1": {"drive": 100}, "2": {"drive": 75}, "3": {"drive": 50}, "4": {"drive": 25}, "5": {"drive": 0}}',
  0.4, true, 'drive_vp_01', false, '{quick,deep}'
);

-- DRIVE SITUATIONAL
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'drive_situational_01', 'drive', NULL, 'situational',
  'Your team has just learned that a major deliverable is due two weeks earlier than planned. What do you do first?',
  '[
    {"key": "a", "text": "Call an emergency meeting and reassign tasks to meet the new deadline", "scores": {"drive": 85, "connection": 40}},
    {"key": "b", "text": "Personally take on the most critical tasks to make sure they get done", "scores": {"drive": 90, "connection": 15}},
    {"key": "c", "text": "Negotiate with the client for a more realistic timeline", "scores": {"drive": 40, "adaptability": 70}},
    {"key": "d", "text": "Identify which parts of the scope can be reduced without hurting quality", "scores": {"drive": 55, "vision": 65}}
  ]',
  '{"a": {"drive": 85, "connection": 40}, "b": {"drive": 90, "connection": 15}, "c": {"drive": 40, "adaptability": 70}, "d": {"drive": 55, "vision": 65}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'drive_situational_02', 'drive', NULL, 'situational',
  'You notice a recurring inefficiency in your daily workflow that wastes about 30 minutes each day. What do you do?',
  '[
    {"key": "a", "text": "Block time this week to build a better process and document it for the team", "scores": {"drive": 80, "vision": 50}},
    {"key": "b", "text": "Mention it at the next team meeting and ask if anyone has ideas", "scores": {"drive": 40, "connection": 60}},
    {"key": "c", "text": "Work around it for now since there are bigger priorities", "scores": {"drive": 20, "adaptability": 45}},
    {"key": "d", "text": "Research existing tools or solutions that could fix it immediately", "scores": {"drive": 70, "adaptability": 55}}
  ]',
  '{"a": {"drive": 80, "vision": 50}, "b": {"drive": 40, "connection": 60}, "c": {"drive": 20, "adaptability": 45}, "d": {"drive": 70, "adaptability": 55}}',
  0.4, false, NULL, false, '{quick,deep}'
),
(
  'drive_situational_03', 'drive', NULL, 'situational',
  'A promising new project opportunity comes up, but your plate is already full. How do you handle it?',
  '[
    {"key": "a", "text": "Take it on anyway and figure out how to make the time", "scores": {"drive": 85, "resilience": 30}},
    {"key": "b", "text": "Delegate some current tasks to free up bandwidth for the new opportunity", "scores": {"drive": 70, "connection": 55}},
    {"key": "c", "text": "Pass on it and stay focused on existing commitments", "scores": {"drive": 25, "integrity": 65}},
    {"key": "d", "text": "Propose a phased approach so you can start small and scale up", "scores": {"drive": 60, "adaptability": 60}}
  ]',
  '{"a": {"drive": 85, "resilience": 30}, "b": {"drive": 70, "connection": 55}, "c": {"drive": 25, "integrity": 65}, "d": {"drive": 60, "adaptability": 60}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'drive_situational_04', 'drive', NULL, 'situational',
  'You have been working on a proposal for weeks and it just got rejected. What is your next move?',
  '[
    {"key": "a", "text": "Ask for specific feedback and submit a revised version within days", "scores": {"drive": 80, "resilience": 70}},
    {"key": "b", "text": "Move on to the next opportunity without dwelling on it", "scores": {"drive": 60, "resilience": 50}},
    {"key": "c", "text": "Take time to understand why it failed before trying again", "scores": {"drive": 45, "vision": 65}},
    {"key": "d", "text": "Share the experience with your team so everyone can learn from it", "scores": {"drive": 35, "connection": 75}}
  ]',
  '{"a": {"drive": 80, "resilience": 70}, "b": {"drive": 60, "resilience": 50}, "c": {"drive": 45, "vision": 65}, "d": {"drive": 35, "connection": 75}}',
  0.5, false, NULL, false, '{deep}'
),
(
  'drive_situational_05', 'drive', NULL, 'situational',
  'Your team is halfway through a project when you realize the original plan will not achieve the intended result. What do you do?',
  '[
    {"key": "a", "text": "Push ahead with the current plan since changing course now would waste time", "scores": {"drive": 70, "adaptability": 15}},
    {"key": "b", "text": "Pause work, redesign the approach, and restart even if it means falling behind", "scores": {"drive": 50, "vision": 75}},
    {"key": "c", "text": "Adjust the plan incrementally while keeping momentum going", "scores": {"drive": 75, "adaptability": 70}},
    {"key": "d", "text": "Bring the team together to discuss options before deciding", "scores": {"drive": 40, "connection": 65}}
  ]',
  '{"a": {"drive": 70, "adaptability": 15}, "b": {"drive": 50, "vision": 75}, "c": {"drive": 75, "adaptability": 70}, "d": {"drive": 40, "connection": 65}}',
  0.65, false, NULL, false, '{deep}'
);

-- DRIVE FORCED CHOICE
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'drive_forced_01', 'drive', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I would rather finish a project quickly and move to the next one than spend extra time perfecting every detail.", "scores": {"drive": 80, "integrity": 30}},
    {"key": "b", "text": "I would rather take the extra time to get every detail right than rush to finish and risk quality.", "scores": {"drive": 30, "integrity": 80}}
  ]',
  '{"a": {"drive": 80, "integrity": 30}, "b": {"drive": 30, "integrity": 80}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'drive_forced_02', 'drive', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I get energy from tackling a packed schedule with tight deadlines.", "scores": {"drive": 80, "resilience": 35}},
    {"key": "b", "text": "I get energy from having enough breathing room to think clearly about what matters most.", "scores": {"drive": 30, "vision": 75}}
  ]',
  '{"a": {"drive": 80, "resilience": 35}, "b": {"drive": 30, "vision": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'drive_forced_03', 'drive', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "When I see a problem, I prefer to fix it right away even if my solution is not perfect.", "scores": {"drive": 75, "adaptability": 35}},
    {"key": "b", "text": "When I see a problem, I prefer to gather input from others before deciding on a fix.", "scores": {"drive": 30, "connection": 75}}
  ]',
  '{"a": {"drive": 75, "adaptability": 35}, "b": {"drive": 30, "connection": 75}}',
  0.45, false, NULL, false, '{deep}'
);

-- ============================================================
-- DIMENSION 2: RESILIENCE
-- Measures: Composure under pressure, stress management, recovery
-- 12 Likert (5 reverse, 2 cross-loaded, 1 IM, 1 validity pair)
-- 5 Situational, 3 Forced Choice
-- ============================================================

-- RESILIENCE LIKERT
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'resilience_likert_01', 'resilience', NULL, 'likert',
  'When a high-stakes situation arises at work, I notice that I think more clearly than usual.',
  NULL,
  '{"1": {"resilience": 0}, "2": {"resilience": 25}, "3": {"resilience": 50}, "4": {"resilience": 75}, "5": {"resilience": 100}}',
  0.5, false, 'resilience_vp_01', false, '{quick,deep}'
),
(
  'resilience_likert_02', 'resilience', NULL, 'likert',
  'After a difficult week, I can usually recover my energy over a single weekend.',
  NULL,
  '{"1": {"resilience": 0}, "2": {"resilience": 25}, "3": {"resilience": 50}, "4": {"resilience": 75}, "5": {"resilience": 100}}',
  0.45, false, NULL, false, '{quick,deep}'
),
(
  'resilience_likert_03', 'resilience', NULL, 'likert',
  'When plans fall apart unexpectedly, I can shift gears without losing my composure.',
  NULL,
  '{"1": {"resilience": 0}, "2": {"resilience": 25}, "3": {"resilience": 50}, "4": {"resilience": 75}, "5": {"resilience": 100}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'resilience_likert_04', 'resilience', NULL, 'likert',
  'In the last month, I have handled a stressful situation without taking it out on the people around me.',
  NULL,
  '{"1": {"resilience": 0}, "2": {"resilience": 25}, "3": {"resilience": 50}, "4": {"resilience": 75}, "5": {"resilience": 100}}',
  0.35, false, NULL, false, '{quick,deep}'
),
-- RESILIENCE LIKERT (cross-loaded: resilience + drive)
(
  'resilience_likert_05', 'resilience', 'drive', 'likert',
  'When facing a series of obstacles, I keep pushing forward rather than looking for an easier path.',
  NULL,
  '{"1": {"resilience": 0, "drive": 0}, "2": {"resilience": 17.5, "drive": 7.5}, "3": {"resilience": 35, "drive": 15}, "4": {"resilience": 52.5, "drive": 22.5}, "5": {"resilience": 70, "drive": 30}}',
  0.55, false, NULL, false, '{quick,deep}'
),
-- RESILIENCE LIKERT (cross-loaded: resilience + connection)
(
  'resilience_likert_06', 'resilience', 'connection', 'likert',
  'When my team is under heavy pressure, I make a point to check in on how each person is holding up.',
  NULL,
  '{"1": {"resilience": 0, "connection": 0}, "2": {"resilience": 17.5, "connection": 7.5}, "3": {"resilience": 35, "connection": 15}, "4": {"resilience": 52.5, "connection": 22.5}, "5": {"resilience": 70, "connection": 30}}',
  0.5, false, NULL, false, '{quick,deep}'
),
-- RESILIENCE LIKERT (impression management)
(
  'resilience_likert_07', 'resilience', NULL, 'likert',
  'I have never felt overwhelmed by work responsibilities, no matter how heavy the load.',
  NULL,
  '{"1": {"resilience": 0}, "2": {"resilience": 25}, "3": {"resilience": 50}, "4": {"resilience": 75}, "5": {"resilience": 100}}',
  0.85, false, NULL, true, '{quick,deep}'
),
-- RESILIENCE LIKERT (reverse-scored)
(
  'resilience_likert_08', 'resilience', NULL, 'likert',
  'When I receive harsh criticism, it stays on my mind for days and affects my work.',
  NULL,
  '{"1": {"resilience": 100}, "2": {"resilience": 75}, "3": {"resilience": 50}, "4": {"resilience": 25}, "5": {"resilience": 0}}',
  0.4, true, NULL, false, '{quick,deep}'
),
(
  'resilience_likert_09', 'resilience', NULL, 'likert',
  'I tend to lose sleep when there is a major unresolved problem at work.',
  NULL,
  '{"1": {"resilience": 100}, "2": {"resilience": 75}, "3": {"resilience": 50}, "4": {"resilience": 25}, "5": {"resilience": 0}}',
  0.35, true, NULL, false, '{quick,deep}'
),
(
  'resilience_likert_10', 'resilience', NULL, 'likert',
  'When multiple things go wrong at once, I find it hard to prioritize and sometimes freeze up.',
  NULL,
  '{"1": {"resilience": 100}, "2": {"resilience": 75}, "3": {"resilience": 50}, "4": {"resilience": 25}, "5": {"resilience": 0}}',
  0.45, true, NULL, false, '{quick,deep}'
),
(
  'resilience_likert_11', 'resilience', NULL, 'likert',
  'After a major failure, I often question whether I am the right person for my role.',
  NULL,
  '{"1": {"resilience": 100}, "2": {"resilience": 75}, "3": {"resilience": 50}, "4": {"resilience": 25}, "5": {"resilience": 0}}',
  0.5, true, NULL, false, '{deep}'
),
(
  'resilience_likert_12', 'resilience', NULL, 'likert',
  'I struggle to bounce back quickly when a project I cared about gets canceled.',
  NULL,
  '{"1": {"resilience": 100}, "2": {"resilience": 75}, "3": {"resilience": 50}, "4": {"resilience": 25}, "5": {"resilience": 0}}',
  0.45, true, 'resilience_vp_01', false, '{deep}'
);

-- RESILIENCE SITUATIONAL
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'resilience_situational_01', 'resilience', NULL, 'situational',
  'A key team member quits in the middle of your busiest season, leaving a critical gap. What do you do?',
  '[
    {"key": "a", "text": "Redistribute their work across the team and personally cover the most urgent tasks", "scores": {"resilience": 75, "drive": 70}},
    {"key": "b", "text": "Take a day to assess the impact and create a realistic revised plan", "scores": {"resilience": 80, "vision": 55}},
    {"key": "c", "text": "Immediately start recruiting a replacement while managing the gap", "scores": {"resilience": 60, "drive": 65}},
    {"key": "d", "text": "Meet with the remaining team to acknowledge the challenge and plan together", "scores": {"resilience": 70, "connection": 75}}
  ]',
  '{"a": {"resilience": 75, "drive": 70}, "b": {"resilience": 80, "vision": 55}, "c": {"resilience": 60, "drive": 65}, "d": {"resilience": 70, "connection": 75}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'resilience_situational_02', 'resilience', NULL, 'situational',
  'You just learned that a client is unhappy with work your team delivered and is threatening to pull the contract. How do you respond?',
  '[
    {"key": "a", "text": "Call the client immediately to understand their concerns and propose fixes", "scores": {"resilience": 70, "connection": 65}},
    {"key": "b", "text": "Review the work yourself first to understand what went wrong before responding", "scores": {"resilience": 75, "integrity": 60}},
    {"key": "c", "text": "Gather your team to figure out the root cause and build a corrective plan", "scores": {"resilience": 65, "vision": 55}},
    {"key": "d", "text": "Accept responsibility immediately and offer to redo the work at no extra cost", "scores": {"resilience": 50, "integrity": 80}}
  ]',
  '{"a": {"resilience": 70, "connection": 65}, "b": {"resilience": 75, "integrity": 60}, "c": {"resilience": 65, "vision": 55}, "d": {"resilience": 50, "integrity": 80}}',
  0.6, false, NULL, false, '{quick,deep}'
),
(
  'resilience_situational_03', 'resilience', NULL, 'situational',
  'You are leading a project when an unexpected regulation change makes your current approach non-compliant. What is your first step?',
  '[
    {"key": "a", "text": "Stop all work immediately until you fully understand the new requirements", "scores": {"resilience": 55, "integrity": 75}},
    {"key": "b", "text": "Identify what can continue as-is and what specifically needs to change", "scores": {"resilience": 80, "adaptability": 70}},
    {"key": "c", "text": "Bring in an expert to advise on the fastest path to compliance", "scores": {"resilience": 65, "vision": 55}},
    {"key": "d", "text": "Communicate the situation to your team and client right away with a preliminary plan", "scores": {"resilience": 70, "connection": 60}}
  ]',
  '{"a": {"resilience": 55, "integrity": 75}, "b": {"resilience": 80, "adaptability": 70}, "c": {"resilience": 65, "vision": 55}, "d": {"resilience": 70, "connection": 60}}',
  0.6, false, NULL, false, '{quick,deep}'
),
(
  'resilience_situational_04', 'resilience', NULL, 'situational',
  'You have had three consecutive project setbacks this month. Your confidence is shaken. How do you handle it?',
  '[
    {"key": "a", "text": "Review what went wrong in each case to find patterns you can fix", "scores": {"resilience": 75, "vision": 60}},
    {"key": "b", "text": "Talk to a mentor or trusted peer about what you are experiencing", "scores": {"resilience": 70, "connection": 70}},
    {"key": "c", "text": "Focus on one small win to rebuild momentum", "scores": {"resilience": 80, "drive": 55}},
    {"key": "d", "text": "Accept that setbacks are part of the process and keep executing your plan", "scores": {"resilience": 65, "drive": 45}}
  ]',
  '{"a": {"resilience": 75, "vision": 60}, "b": {"resilience": 70, "connection": 70}, "c": {"resilience": 80, "drive": 55}, "d": {"resilience": 65, "drive": 45}}',
  0.7, false, NULL, false, '{deep}'
),
(
  'resilience_situational_05', 'resilience', NULL, 'situational',
  'During a live presentation to a potential client, your technology fails and the demo does not work. What do you do?',
  '[
    {"key": "a", "text": "Switch to a whiteboard explanation and walk them through the concept verbally", "scores": {"resilience": 85, "adaptability": 75}},
    {"key": "b", "text": "Apologize, reschedule the demo, and make sure the tech is bulletproof next time", "scores": {"resilience": 50, "integrity": 65}},
    {"key": "c", "text": "Use humor to lighten the moment and pivot to a conversation about their needs instead", "scores": {"resilience": 75, "connection": 70}},
    {"key": "d", "text": "Troubleshoot the issue on the spot while keeping the client engaged", "scores": {"resilience": 70, "drive": 60}}
  ]',
  '{"a": {"resilience": 85, "adaptability": 75}, "b": {"resilience": 50, "integrity": 65}, "c": {"resilience": 75, "connection": 70}, "d": {"resilience": 70, "drive": 60}}',
  0.55, false, NULL, false, '{deep}'
);

-- RESILIENCE FORCED CHOICE
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'resilience_forced_01', 'resilience', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I perform best when the stakes are high and the pressure is on.", "scores": {"resilience": 80, "drive": 40}},
    {"key": "b", "text": "I perform best when I have had time to prepare and think things through.", "scores": {"resilience": 30, "vision": 75}}
  ]',
  '{"a": {"resilience": 80, "drive": 40}, "b": {"resilience": 30, "vision": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'resilience_forced_02', 'resilience', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "After a bad day, I can usually reset and start fresh the next morning.", "scores": {"resilience": 80, "adaptability": 35}},
    {"key": "b", "text": "After a bad day, I need to talk it through with someone I trust before I can move on.", "scores": {"resilience": 30, "connection": 80}}
  ]',
  '{"a": {"resilience": 80, "adaptability": 35}, "b": {"resilience": 30, "connection": 80}}',
  0.45, false, NULL, false, '{quick,deep}'
),
(
  'resilience_forced_03', 'resilience', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I stay calm in a crisis because I focus on what I can control right now.", "scores": {"resilience": 80, "integrity": 35}},
    {"key": "b", "text": "I stay calm in a crisis because I keep the bigger picture in mind.", "scores": {"resilience": 35, "vision": 80}}
  ]',
  '{"a": {"resilience": 80, "integrity": 35}, "b": {"resilience": 35, "vision": 80}}',
  0.55, false, NULL, false, '{deep}'
);

-- ============================================================
-- DIMENSION 3: VISION
-- Measures: Strategic thinking, creativity, ability to see the bigger picture
-- 12 Likert (5 reverse, 2 cross-loaded, 1 IM, 1 validity pair)
-- 5 Situational, 3 Forced Choice
-- ============================================================

-- VISION LIKERT
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'vision_likert_01', 'vision', NULL, 'likert',
  'When starting a new project, I spend time thinking about where it could lead in two or three years, not just this quarter.',
  NULL,
  '{"1": {"vision": 0}, "2": {"vision": 25}, "3": {"vision": 50}, "4": {"vision": 75}, "5": {"vision": 100}}',
  0.5, false, 'vision_vp_01', false, '{quick,deep}'
),
(
  'vision_likert_02', 'vision', NULL, 'likert',
  'I often see connections between unrelated problems that others miss.',
  NULL,
  '{"1": {"vision": 0}, "2": {"vision": 25}, "3": {"vision": 50}, "4": {"vision": 75}, "5": {"vision": 100}}',
  0.6, false, NULL, false, '{quick,deep}'
),
(
  'vision_likert_03', 'vision', NULL, 'likert',
  'When explaining a goal to my team, I describe what success looks like rather than just listing tasks.',
  NULL,
  '{"1": {"vision": 0}, "2": {"vision": 25}, "3": {"vision": 50}, "4": {"vision": 75}, "5": {"vision": 100}}',
  0.45, false, NULL, false, '{quick,deep}'
),
(
  'vision_likert_04', 'vision', NULL, 'likert',
  'In the last month, I have questioned whether our current approach is the best way to reach our goals.',
  NULL,
  '{"1": {"vision": 0}, "2": {"vision": 25}, "3": {"vision": 50}, "4": {"vision": 75}, "5": {"vision": 100}}',
  0.4, false, NULL, false, '{quick,deep}'
),
-- VISION LIKERT (cross-loaded: vision + adaptability)
(
  'vision_likert_05', 'vision', 'adaptability', 'likert',
  'I get excited when an industry shift forces us to rethink our entire strategy.',
  NULL,
  '{"1": {"vision": 0, "adaptability": 0}, "2": {"vision": 17.5, "adaptability": 7.5}, "3": {"vision": 35, "adaptability": 15}, "4": {"vision": 52.5, "adaptability": 22.5}, "5": {"vision": 70, "adaptability": 30}}',
  0.6, false, NULL, false, '{quick,deep}'
),
-- VISION LIKERT (cross-loaded: vision + drive — Catalyst differentiation)
(
  'vision_likert_06', 'vision', 'drive', 'likert',
  'When I have a bold idea, I create a plan to test it within the same week rather than just thinking about it.',
  NULL,
  '{"1": {"vision": 0, "drive": 0}, "2": {"vision": 17.5, "drive": 7.5}, "3": {"vision": 35, "drive": 15}, "4": {"vision": 52.5, "drive": 22.5}, "5": {"vision": 70, "drive": 30}}',
  0.65, false, NULL, false, '{deep}'
),
-- VISION LIKERT (impression management)
(
  'vision_likert_07', 'vision', NULL, 'likert',
  'Every decision I make is guided by a clear long-term strategy that I have already mapped out.',
  NULL,
  '{"1": {"vision": 0}, "2": {"vision": 25}, "3": {"vision": 50}, "4": {"vision": 75}, "5": {"vision": 100}}',
  0.8, false, NULL, true, '{quick,deep}'
),
-- VISION LIKERT (reverse-scored)
(
  'vision_likert_08', 'vision', NULL, 'likert',
  'I prefer to focus on the task in front of me rather than think about long-term strategy.',
  NULL,
  '{"1": {"vision": 100}, "2": {"vision": 75}, "3": {"vision": 50}, "4": {"vision": 25}, "5": {"vision": 0}}',
  0.35, true, NULL, false, '{quick,deep}'
),
(
  'vision_likert_09', 'vision', NULL, 'likert',
  'When someone presents a new idea, my first instinct is to look for reasons it will not work.',
  NULL,
  '{"1": {"vision": 100}, "2": {"vision": 75}, "3": {"vision": 50}, "4": {"vision": 25}, "5": {"vision": 0}}',
  0.4, true, NULL, false, '{quick,deep}'
),
(
  'vision_likert_10', 'vision', NULL, 'likert',
  'I find strategic planning exercises frustrating because there are too many unknowns.',
  NULL,
  '{"1": {"vision": 100}, "2": {"vision": 75}, "3": {"vision": 50}, "4": {"vision": 25}, "5": {"vision": 0}}',
  0.5, true, NULL, false, '{quick,deep}'
),
(
  'vision_likert_11', 'vision', NULL, 'likert',
  'I rarely think about how trends in other industries might affect my own work.',
  NULL,
  '{"1": {"vision": 100}, "2": {"vision": 75}, "3": {"vision": 50}, "4": {"vision": 25}, "5": {"vision": 0}}',
  0.45, true, NULL, false, '{deep}'
),
-- VISION LIKERT (validity pair partner + reverse)
(
  'vision_likert_12', 'vision', NULL, 'likert',
  'I tend to focus on what needs to happen today rather than planning several years ahead.',
  NULL,
  '{"1": {"vision": 100}, "2": {"vision": 75}, "3": {"vision": 50}, "4": {"vision": 25}, "5": {"vision": 0}}',
  0.4, true, 'vision_vp_01', false, '{deep}'
);

-- VISION SITUATIONAL
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'vision_situational_01', 'vision', NULL, 'situational',
  'Your company has been doing the same type of work for years and it is profitable but growth has stalled. What do you do?',
  '[
    {"key": "a", "text": "Research emerging markets and propose a new service line that leverages existing skills", "scores": {"vision": 85, "adaptability": 60}},
    {"key": "b", "text": "Double down on what is working and find ways to do it more efficiently", "scores": {"vision": 30, "drive": 70}},
    {"key": "c", "text": "Survey clients and team members to understand what opportunities they see", "scores": {"vision": 55, "connection": 65}},
    {"key": "d", "text": "Study competitors to see what they are doing differently", "scores": {"vision": 60, "adaptability": 50}}
  ]',
  '{"a": {"vision": 85, "adaptability": 60}, "b": {"vision": 30, "drive": 70}, "c": {"vision": 55, "connection": 65}, "d": {"vision": 60, "adaptability": 50}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'vision_situational_02', 'vision', NULL, 'situational',
  'You are asked to present a 3-year plan for your team or company. How do you approach it?',
  '[
    {"key": "a", "text": "Start by identifying the big trends that will shape the industry and work backward to actions", "scores": {"vision": 85, "adaptability": 45}},
    {"key": "b", "text": "Build on current performance metrics and project reasonable growth targets", "scores": {"vision": 40, "drive": 60}},
    {"key": "c", "text": "Interview team members and stakeholders about what they want the future to look like", "scores": {"vision": 55, "connection": 70}},
    {"key": "d", "text": "Create multiple scenarios with different assumptions and plan for each", "scores": {"vision": 75, "resilience": 50}}
  ]',
  '{"a": {"vision": 85, "adaptability": 45}, "b": {"vision": 40, "drive": 60}, "c": {"vision": 55, "connection": 70}, "d": {"vision": 75, "resilience": 50}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'vision_situational_03', 'vision', NULL, 'situational',
  'A team member pitches a creative but risky idea that could disrupt your current process. How do you respond?',
  '[
    {"key": "a", "text": "Ask them to run a small pilot to test the concept before committing resources", "scores": {"vision": 75, "adaptability": 65}},
    {"key": "b", "text": "Encourage the idea but ask them to show how it aligns with current goals", "scores": {"vision": 60, "integrity": 55}},
    {"key": "c", "text": "Get excited and help them develop the idea further right away", "scores": {"vision": 80, "drive": 50}},
    {"key": "d", "text": "Appreciate the creativity but explain why the current process needs to stay stable", "scores": {"vision": 25, "resilience": 60}}
  ]',
  '{"a": {"vision": 75, "adaptability": 65}, "b": {"vision": 60, "integrity": 55}, "c": {"vision": 80, "drive": 50}, "d": {"vision": 25, "resilience": 60}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'vision_situational_04', 'vision', NULL, 'situational',
  'You realize that a technology your team has been ignoring could completely change how your industry works in the next five years. What do you do?',
  '[
    {"key": "a", "text": "Start learning about it yourself and share what you find with the team", "scores": {"vision": 80, "drive": 55}},
    {"key": "b", "text": "Hire or consult with someone who already understands it deeply", "scores": {"vision": 65, "adaptability": 60}},
    {"key": "c", "text": "Wait to see if the technology actually gains traction before investing time", "scores": {"vision": 25, "resilience": 45}},
    {"key": "d", "text": "Organize a team workshop to explore how it might apply to your work", "scores": {"vision": 70, "connection": 55}}
  ]',
  '{"a": {"vision": 80, "drive": 55}, "b": {"vision": 65, "adaptability": 60}, "c": {"vision": 25, "resilience": 45}, "d": {"vision": 70, "connection": 55}}',
  0.6, false, NULL, false, '{deep}'
),
(
  'vision_situational_05', 'vision', NULL, 'situational',
  'Two of your most experienced team members disagree about the direction of a major project. One wants to stick with what has worked before; the other wants to try something new. How do you decide?',
  '[
    {"key": "a", "text": "Go with the new approach because innovation is how you stay competitive", "scores": {"vision": 80, "adaptability": 60}},
    {"key": "b", "text": "Go with the proven approach because reliability matters more than novelty", "scores": {"vision": 25, "integrity": 65}},
    {"key": "c", "text": "Find a way to combine elements of both approaches into a hybrid plan", "scores": {"vision": 65, "connection": 55}},
    {"key": "d", "text": "Set clear criteria for success and let the data decide which approach is better", "scores": {"vision": 70, "integrity": 60}}
  ]',
  '{"a": {"vision": 80, "adaptability": 60}, "b": {"vision": 25, "integrity": 65}, "c": {"vision": 65, "connection": 55}, "d": {"vision": 70, "integrity": 60}}',
  0.65, false, NULL, false, '{deep}'
);

-- VISION FORCED CHOICE
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'vision_forced_01', 'vision', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I would rather explore a bold new idea that might fail than repeat a safe strategy that is guaranteed to work.", "scores": {"vision": 80, "adaptability": 40}},
    {"key": "b", "text": "I would rather perfect a proven strategy that delivers consistent results than chase something unproven.", "scores": {"vision": 25, "integrity": 75}}
  ]',
  '{"a": {"vision": 80, "adaptability": 40}, "b": {"vision": 25, "integrity": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'vision_forced_02', 'vision', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "My best ideas come when I step back from daily work and think about the big picture.", "scores": {"vision": 80, "resilience": 30}},
    {"key": "b", "text": "My best ideas come when I am in the middle of doing the work and solving real problems.", "scores": {"vision": 30, "drive": 80}}
  ]',
  '{"a": {"vision": 80, "resilience": 30}, "b": {"vision": 30, "drive": 80}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'vision_forced_03', 'vision', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I am energized by imagining future possibilities that do not exist yet.", "scores": {"vision": 80, "adaptability": 35}},
    {"key": "b", "text": "I am energized by making today''s operations run as smoothly as possible.", "scores": {"vision": 25, "drive": 75}}
  ]',
  '{"a": {"vision": 80, "adaptability": 35}, "b": {"vision": 25, "drive": 75}}',
  0.45, false, NULL, false, '{deep}'
);

-- ============================================================
-- DIMENSION 4: CONNECTION
-- Measures: Empathy, trust-building, team cohesion, communication
-- 12 Likert (5 reverse, 2 cross-loaded, 1 IM, 1 validity pair)
-- 5 Situational, 3 Forced Choice
-- ============================================================

-- CONNECTION LIKERT
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'connection_likert_01', 'connection', NULL, 'likert',
  'When a team member seems off, I make a point to check in with them privately to see if something is wrong.',
  NULL,
  '{"1": {"connection": 0}, "2": {"connection": 25}, "3": {"connection": 50}, "4": {"connection": 75}, "5": {"connection": 100}}',
  0.4, false, 'connection_vp_01', false, '{quick,deep}'
),
(
  'connection_likert_02', 'connection', NULL, 'likert',
  'Before making a decision that affects my team, I ask for their input even when I already have a strong opinion.',
  NULL,
  '{"1": {"connection": 0}, "2": {"connection": 25}, "3": {"connection": 50}, "4": {"connection": 75}, "5": {"connection": 100}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'connection_likert_03', 'connection', NULL, 'likert',
  'In the last month, I have given specific praise to a team member for something they did well.',
  NULL,
  '{"1": {"connection": 0}, "2": {"connection": 25}, "3": {"connection": 50}, "4": {"connection": 75}, "5": {"connection": 100}}',
  0.35, false, NULL, false, '{quick,deep}'
),
(
  'connection_likert_04', 'connection', NULL, 'likert',
  'I can usually tell when someone on my team is frustrated or disengaged before they say anything.',
  NULL,
  '{"1": {"connection": 0}, "2": {"connection": 25}, "3": {"connection": 50}, "4": {"connection": 75}, "5": {"connection": 100}}',
  0.55, false, NULL, false, '{quick,deep}'
),
-- CONNECTION LIKERT (cross-loaded: connection + integrity)
(
  'connection_likert_05', 'connection', 'integrity', 'likert',
  'When I give feedback to someone, I am honest even when it is uncomfortable, because I care about their growth.',
  NULL,
  '{"1": {"connection": 0, "integrity": 0}, "2": {"connection": 17.5, "integrity": 7.5}, "3": {"connection": 35, "integrity": 15}, "4": {"connection": 52.5, "integrity": 22.5}, "5": {"connection": 70, "integrity": 30}}',
  0.55, false, NULL, false, '{quick,deep}'
),
-- CONNECTION LIKERT (cross-loaded: connection + resilience — Anchor differentiation)
(
  'connection_likert_06', 'connection', 'resilience', 'likert',
  'During high-stress periods, I make sure my team knows I am available to talk through any concerns.',
  NULL,
  '{"1": {"connection": 0, "resilience": 0}, "2": {"connection": 17.5, "resilience": 7.5}, "3": {"connection": 35, "resilience": 15}, "4": {"connection": 52.5, "resilience": 22.5}, "5": {"connection": 70, "resilience": 30}}',
  0.5, false, NULL, false, '{deep}'
),
-- CONNECTION LIKERT (impression management)
(
  'connection_likert_07', 'connection', NULL, 'likert',
  'I have never lost my patience with a team member, even in the most stressful situations.',
  NULL,
  '{"1": {"connection": 0}, "2": {"connection": 25}, "3": {"connection": 50}, "4": {"connection": 75}, "5": {"connection": 100}}',
  0.85, false, NULL, true, '{quick,deep}'
),
-- CONNECTION LIKERT (reverse-scored)
(
  'connection_likert_08', 'connection', NULL, 'likert',
  'I find it draining to spend time understanding how each person on my team prefers to work.',
  NULL,
  '{"1": {"connection": 100}, "2": {"connection": 75}, "3": {"connection": 50}, "4": {"connection": 25}, "5": {"connection": 0}}',
  0.4, true, NULL, false, '{quick,deep}'
),
(
  'connection_likert_09', 'connection', NULL, 'likert',
  'I tend to make decisions based on data and logic without spending much time on how people feel about them.',
  NULL,
  '{"1": {"connection": 100}, "2": {"connection": 75}, "3": {"connection": 50}, "4": {"connection": 25}, "5": {"connection": 0}}',
  0.45, true, NULL, false, '{quick,deep}'
),
(
  'connection_likert_10', 'connection', NULL, 'likert',
  'When a team member underperforms, I address the issue directly without spending much time exploring why.',
  NULL,
  '{"1": {"connection": 100}, "2": {"connection": 75}, "3": {"connection": 50}, "4": {"connection": 25}, "5": {"connection": 0}}',
  0.5, true, NULL, false, '{quick,deep}'
),
(
  'connection_likert_11', 'connection', NULL, 'likert',
  'I sometimes avoid difficult conversations with team members because I do not want to create conflict.',
  NULL,
  '{"1": {"connection": 100}, "2": {"connection": 75}, "3": {"connection": 50}, "4": {"connection": 25}, "5": {"connection": 0}}',
  0.4, true, NULL, false, '{deep}'
),
-- CONNECTION LIKERT (validity pair partner + reverse)
(
  'connection_likert_12', 'connection', NULL, 'likert',
  'I do not usually notice when someone on my team is having a tough day until they tell me directly.',
  NULL,
  '{"1": {"connection": 100}, "2": {"connection": 75}, "3": {"connection": 50}, "4": {"connection": 25}, "5": {"connection": 0}}',
  0.4, true, 'connection_vp_01', false, '{deep}'
);

-- CONNECTION SITUATIONAL
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'connection_situational_01', 'connection', NULL, 'situational',
  'Two members of your team are in a heated disagreement that is affecting the whole group. What do you do?',
  '[
    {"key": "a", "text": "Meet with each person privately to understand their perspective before bringing them together", "scores": {"connection": 85, "integrity": 50}},
    {"key": "b", "text": "Address it immediately in a team meeting so everyone can clear the air", "scores": {"connection": 55, "drive": 60}},
    {"key": "c", "text": "Let them work it out on their own unless it directly impacts deliverables", "scores": {"connection": 20, "drive": 45}},
    {"key": "d", "text": "Set clear ground rules for professional behavior and redirect focus to the work", "scores": {"connection": 45, "integrity": 70}}
  ]',
  '{"a": {"connection": 85, "integrity": 50}, "b": {"connection": 55, "drive": 60}, "c": {"connection": 20, "drive": 45}, "d": {"connection": 45, "integrity": 70}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'connection_situational_02', 'connection', NULL, 'situational',
  'A reliable team member has been missing deadlines and seems disengaged recently. How do you handle it?',
  '[
    {"key": "a", "text": "Have a private conversation to ask if everything is okay and offer support", "scores": {"connection": 85, "resilience": 40}},
    {"key": "b", "text": "Give them a formal warning since deadlines are deadlines", "scores": {"connection": 20, "integrity": 60}},
    {"key": "c", "text": "Reassign their critical tasks and give them less pressure until they recover", "scores": {"connection": 65, "adaptability": 55}},
    {"key": "d", "text": "Review their recent work to identify where they are struggling and offer specific help", "scores": {"connection": 70, "drive": 45}}
  ]',
  '{"a": {"connection": 85, "resilience": 40}, "b": {"connection": 20, "integrity": 60}, "c": {"connection": 65, "adaptability": 55}, "d": {"connection": 70, "drive": 45}}',
  0.45, false, NULL, false, '{quick,deep}'
),
(
  'connection_situational_03', 'connection', NULL, 'situational',
  'You have just taken over leadership of a new team that does not know you yet. What is your first priority?',
  '[
    {"key": "a", "text": "Meet with each person one-on-one to learn about their role, goals, and concerns", "scores": {"connection": 85, "integrity": 45}},
    {"key": "b", "text": "Review the team''s current processes and identify quick improvements", "scores": {"connection": 30, "drive": 70}},
    {"key": "c", "text": "Share your leadership style and expectations in a team meeting", "scores": {"connection": 50, "vision": 55}},
    {"key": "d", "text": "Observe how the team works together for a week before making any changes", "scores": {"connection": 60, "adaptability": 65}}
  ]',
  '{"a": {"connection": 85, "integrity": 45}, "b": {"connection": 30, "drive": 70}, "c": {"connection": 50, "vision": 55}, "d": {"connection": 60, "adaptability": 65}}',
  0.45, false, NULL, false, '{quick,deep}'
),
(
  'connection_situational_04', 'connection', NULL, 'situational',
  'A newer team member makes a significant mistake that costs time and money. How do you respond?',
  '[
    {"key": "a", "text": "Sit down with them to understand what happened and help them learn from it", "scores": {"connection": 80, "integrity": 55}},
    {"key": "b", "text": "Fix the problem first, then document what went wrong so it does not happen again", "scores": {"connection": 35, "drive": 65}},
    {"key": "c", "text": "Assign them a mentor to prevent similar issues going forward", "scores": {"connection": 75, "vision": 45}},
    {"key": "d", "text": "Address it directly and set clearer expectations for next time", "scores": {"connection": 45, "integrity": 70}}
  ]',
  '{"a": {"connection": 80, "integrity": 55}, "b": {"connection": 35, "drive": 65}, "c": {"connection": 75, "vision": 45}, "d": {"connection": 45, "integrity": 70}}',
  0.5, false, NULL, false, '{deep}'
),
(
  'connection_situational_05', 'connection', NULL, 'situational',
  'Your team just finished a grueling three-month project. What do you do in the first week after delivery?',
  '[
    {"key": "a", "text": "Organize a team celebration and personally thank each person for their contribution", "scores": {"connection": 85, "resilience": 40}},
    {"key": "b", "text": "Run a retrospective to capture what went well and what to improve next time", "scores": {"connection": 55, "vision": 60}},
    {"key": "c", "text": "Give the team a lighter schedule for a few days to recover", "scores": {"connection": 70, "resilience": 55}},
    {"key": "d", "text": "Start planning the next project while momentum is high", "scores": {"connection": 15, "drive": 80}}
  ]',
  '{"a": {"connection": 85, "resilience": 40}, "b": {"connection": 55, "vision": 60}, "c": {"connection": 70, "resilience": 55}, "d": {"connection": 15, "drive": 80}}',
  0.45, false, NULL, false, '{deep}'
);

-- CONNECTION FORCED CHOICE
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'connection_forced_01', 'connection', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "The best teams are built on strong personal relationships and mutual trust.", "scores": {"connection": 80, "integrity": 35}},
    {"key": "b", "text": "The best teams are built on clear roles, accountability, and shared goals.", "scores": {"connection": 30, "drive": 75}}
  ]',
  '{"a": {"connection": 80, "integrity": 35}, "b": {"connection": 30, "drive": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'connection_forced_02', 'connection', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I would rather spend time understanding what my team needs than optimizing processes.", "scores": {"connection": 80, "resilience": 30}},
    {"key": "b", "text": "I would rather create efficient systems that help my team succeed than manage their individual needs.", "scores": {"connection": 30, "vision": 75}}
  ]',
  '{"a": {"connection": 80, "resilience": 30}, "b": {"connection": 30, "vision": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'connection_forced_03', 'connection', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I prefer to lead by building consensus and getting everyone aligned.", "scores": {"connection": 80, "adaptability": 35}},
    {"key": "b", "text": "I prefer to lead by making clear decisions and giving people direction.", "scores": {"connection": 25, "drive": 80}}
  ]',
  '{"a": {"connection": 80, "adaptability": 35}, "b": {"connection": 25, "drive": 80}}',
  0.45, false, NULL, false, '{deep}'
);

-- ============================================================
-- DIMENSION 5: ADAPTABILITY
-- Measures: Learning agility, comfort with ambiguity, willingness to change
-- 12 Likert (5 reverse, 2 cross-loaded, 1 IM, 1 validity pair)
-- 5 Situational, 3 Forced Choice
-- ============================================================

-- ADAPTABILITY LIKERT
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'adaptability_likert_01', 'adaptability', NULL, 'likert',
  'When the rules or expectations change unexpectedly, I adjust my approach without much difficulty.',
  NULL,
  '{"1": {"adaptability": 0}, "2": {"adaptability": 25}, "3": {"adaptability": 50}, "4": {"adaptability": 75}, "5": {"adaptability": 100}}',
  0.45, false, 'adaptability_vp_01', false, '{quick,deep}'
),
(
  'adaptability_likert_02', 'adaptability', NULL, 'likert',
  'In the last month, I have tried a new method or tool to improve how I work.',
  NULL,
  '{"1": {"adaptability": 0}, "2": {"adaptability": 25}, "3": {"adaptability": 50}, "4": {"adaptability": 75}, "5": {"adaptability": 100}}',
  0.35, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_likert_03', 'adaptability', NULL, 'likert',
  'I enjoy working on projects where the scope is not fully defined yet.',
  NULL,
  '{"1": {"adaptability": 0}, "2": {"adaptability": 25}, "3": {"adaptability": 50}, "4": {"adaptability": 75}, "5": {"adaptability": 100}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_likert_04', 'adaptability', NULL, 'likert',
  'When I realize my initial approach is not working, I switch strategies quickly rather than trying harder at the same thing.',
  NULL,
  '{"1": {"adaptability": 0}, "2": {"adaptability": 25}, "3": {"adaptability": 50}, "4": {"adaptability": 75}, "5": {"adaptability": 100}}',
  0.5, false, NULL, false, '{quick,deep}'
),
-- ADAPTABILITY LIKERT (cross-loaded: adaptability + vision)
(
  'adaptability_likert_05', 'adaptability', 'vision', 'likert',
  'I actively look for trends outside my industry that could change how we work in the future.',
  NULL,
  '{"1": {"adaptability": 0, "vision": 0}, "2": {"adaptability": 17.5, "vision": 7.5}, "3": {"adaptability": 35, "vision": 15}, "4": {"adaptability": 52.5, "vision": 22.5}, "5": {"adaptability": 70, "vision": 30}}',
  0.6, false, NULL, false, '{quick,deep}'
),
-- ADAPTABILITY LIKERT (cross-loaded: adaptability + vision)
(
  'adaptability_likert_06', 'adaptability', 'vision', 'likert',
  'When an industry shift happens, I see it as an opportunity to reinvent how we do things rather than a threat.',
  NULL,
  '{"1": {"adaptability": 0, "vision": 0}, "2": {"adaptability": 17.5, "vision": 7.5}, "3": {"adaptability": 35, "vision": 15}, "4": {"adaptability": 52.5, "vision": 22.5}, "5": {"adaptability": 70, "vision": 30}}',
  0.6, false, NULL, false, '{deep}'
),
-- ADAPTABILITY LIKERT (impression management)
(
  'adaptability_likert_07', 'adaptability', NULL, 'likert',
  'I always embrace change immediately, without any period of adjustment or discomfort.',
  NULL,
  '{"1": {"adaptability": 0}, "2": {"adaptability": 25}, "3": {"adaptability": 50}, "4": {"adaptability": 75}, "5": {"adaptability": 100}}',
  0.8, false, NULL, true, '{quick,deep}'
),
-- ADAPTABILITY LIKERT (reverse-scored)
(
  'adaptability_likert_08', 'adaptability', NULL, 'likert',
  'I prefer to stick with methods that have worked in the past rather than experiment with new ones.',
  NULL,
  '{"1": {"adaptability": 100}, "2": {"adaptability": 75}, "3": {"adaptability": 50}, "4": {"adaptability": 25}, "5": {"adaptability": 0}}',
  0.35, true, NULL, false, '{quick,deep}'
),
(
  'adaptability_likert_09', 'adaptability', NULL, 'likert',
  'When a project changes direction midway through, I feel frustrated rather than curious.',
  NULL,
  '{"1": {"adaptability": 100}, "2": {"adaptability": 75}, "3": {"adaptability": 50}, "4": {"adaptability": 25}, "5": {"adaptability": 0}}',
  0.4, true, NULL, false, '{quick,deep}'
),
(
  'adaptability_likert_10', 'adaptability', NULL, 'likert',
  'I feel uncomfortable when I have to make decisions without having all the information.',
  NULL,
  '{"1": {"adaptability": 100}, "2": {"adaptability": 75}, "3": {"adaptability": 50}, "4": {"adaptability": 25}, "5": {"adaptability": 0}}',
  0.4, true, NULL, false, '{quick,deep}'
),
(
  'adaptability_likert_11', 'adaptability', NULL, 'likert',
  'I find it hard to let go of a process I built, even when there is clearly a better way.',
  NULL,
  '{"1": {"adaptability": 100}, "2": {"adaptability": 75}, "3": {"adaptability": 50}, "4": {"adaptability": 25}, "5": {"adaptability": 0}}',
  0.5, true, NULL, false, '{deep}'
),
-- ADAPTABILITY LIKERT (validity pair partner + reverse)
(
  'adaptability_likert_12', 'adaptability', NULL, 'likert',
  'When plans change at the last minute, I need significant time to regroup before I can be productive.',
  NULL,
  '{"1": {"adaptability": 100}, "2": {"adaptability": 75}, "3": {"adaptability": 50}, "4": {"adaptability": 25}, "5": {"adaptability": 0}}',
  0.45, true, 'adaptability_vp_01', false, '{deep}'
);

-- ADAPTABILITY SITUATIONAL
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'adaptability_situational_01', 'adaptability', NULL, 'situational',
  'Your company adopts a completely new project management tool and everyone is expected to switch within two weeks. How do you respond?',
  '[
    {"key": "a", "text": "Dive into it immediately, learn by doing, and help others who are struggling", "scores": {"adaptability": 85, "connection": 50}},
    {"key": "b", "text": "Set aside dedicated time to learn the tool properly before trying to use it on real work", "scores": {"adaptability": 65, "integrity": 55}},
    {"key": "c", "text": "Push back and explain why the transition timeline is unrealistic", "scores": {"adaptability": 25, "resilience": 55}},
    {"key": "d", "text": "Find ways to use the new tool alongside the old one during the transition", "scores": {"adaptability": 55, "vision": 45}}
  ]',
  '{"a": {"adaptability": 85, "connection": 50}, "b": {"adaptability": 65, "integrity": 55}, "c": {"adaptability": 25, "resilience": 55}, "d": {"adaptability": 55, "vision": 45}}',
  0.45, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_situational_02', 'adaptability', NULL, 'situational',
  'A client changes the project requirements significantly after your team has already completed 40% of the work. What do you do?',
  '[
    {"key": "a", "text": "Assess what can be reused and create a revised plan that incorporates the changes", "scores": {"adaptability": 80, "vision": 55}},
    {"key": "b", "text": "Push back on the scope change and negotiate to keep as much of the original plan as possible", "scores": {"adaptability": 25, "drive": 65}},
    {"key": "c", "text": "Accept the changes and rally the team around the new direction", "scores": {"adaptability": 75, "connection": 55}},
    {"key": "d", "text": "Request additional time or resources to accommodate the new scope", "scores": {"adaptability": 50, "integrity": 60}}
  ]',
  '{"a": {"adaptability": 80, "vision": 55}, "b": {"adaptability": 25, "drive": 65}, "c": {"adaptability": 75, "connection": 55}, "d": {"adaptability": 50, "integrity": 60}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_situational_03', 'adaptability', NULL, 'situational',
  'You are promoted into a role that requires skills you have never used before. How do you approach it?',
  '[
    {"key": "a", "text": "Find people who have done this role well and learn from them as fast as possible", "scores": {"adaptability": 80, "connection": 60}},
    {"key": "b", "text": "Study the role requirements and create a 90-day learning plan for yourself", "scores": {"adaptability": 65, "vision": 55}},
    {"key": "c", "text": "Jump in and learn by doing, adjusting as you go", "scores": {"adaptability": 85, "drive": 55}},
    {"key": "d", "text": "Be upfront about your learning curve and ask your team for patience and support", "scores": {"adaptability": 70, "integrity": 65}}
  ]',
  '{"a": {"adaptability": 80, "connection": 60}, "b": {"adaptability": 65, "vision": 55}, "c": {"adaptability": 85, "drive": 55}, "d": {"adaptability": 70, "integrity": 65}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_situational_04', 'adaptability', NULL, 'situational',
  'You discover that a method you have used successfully for years is now considered outdated by your industry. What do you do?',
  '[
    {"key": "a", "text": "Immediately start learning the new method and phase out the old one", "scores": {"adaptability": 85, "drive": 55}},
    {"key": "b", "text": "Test the new method on a small project before fully committing to the switch", "scores": {"adaptability": 70, "integrity": 55}},
    {"key": "c", "text": "Keep using the old method as long as it still produces good results", "scores": {"adaptability": 20, "resilience": 50}},
    {"key": "d", "text": "Combine the best parts of both approaches to create something better", "scores": {"adaptability": 75, "vision": 60}}
  ]',
  '{"a": {"adaptability": 85, "drive": 55}, "b": {"adaptability": 70, "integrity": 55}, "c": {"adaptability": 20, "resilience": 50}, "d": {"adaptability": 75, "vision": 60}}',
  0.5, false, NULL, false, '{deep}'
),
(
  'adaptability_situational_05', 'adaptability', NULL, 'situational',
  'You are working in a completely new market segment with unfamiliar clients and different expectations. How do you get up to speed?',
  '[
    {"key": "a", "text": "Spend the first few weeks observing and asking questions before trying to lead", "scores": {"adaptability": 75, "connection": 60}},
    {"key": "b", "text": "Apply what you know from your previous experience and adjust based on feedback", "scores": {"adaptability": 60, "drive": 55}},
    {"key": "c", "text": "Hire or partner with someone who already knows this market well", "scores": {"adaptability": 55, "vision": 60}},
    {"key": "d", "text": "Read everything you can find and develop a hypothesis to test quickly", "scores": {"adaptability": 80, "vision": 65}}
  ]',
  '{"a": {"adaptability": 75, "connection": 60}, "b": {"adaptability": 60, "drive": 55}, "c": {"adaptability": 55, "vision": 60}, "d": {"adaptability": 80, "vision": 65}}',
  0.6, false, NULL, false, '{deep}'
);

-- ADAPTABILITY FORCED CHOICE
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'adaptability_forced_01', 'adaptability', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I thrive in situations where the plan keeps changing and I have to figure things out on the fly.", "scores": {"adaptability": 80, "resilience": 35}},
    {"key": "b", "text": "I thrive in situations where there is a clear plan and I know exactly what is expected.", "scores": {"adaptability": 25, "integrity": 75}}
  ]',
  '{"a": {"adaptability": 80, "resilience": 35}, "b": {"adaptability": 25, "integrity": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_forced_02', 'adaptability', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I would rather try five different approaches quickly than spend a long time perfecting one.", "scores": {"adaptability": 80, "drive": 40}},
    {"key": "b", "text": "I would rather thoroughly research the best approach and do it right the first time.", "scores": {"adaptability": 25, "vision": 75}}
  ]',
  '{"a": {"adaptability": 80, "drive": 40}, "b": {"adaptability": 25, "vision": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'adaptability_forced_03', 'adaptability', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "The most exciting projects are the ones where nobody has done it before.", "scores": {"adaptability": 80, "vision": 40}},
    {"key": "b", "text": "The most rewarding projects are the ones where I can apply my expertise to deliver excellent results.", "scores": {"adaptability": 25, "drive": 75}}
  ]',
  '{"a": {"adaptability": 80, "vision": 40}, "b": {"adaptability": 25, "drive": 75}}',
  0.45, false, NULL, false, '{deep}'
);

-- ============================================================
-- DIMENSION 6: INTEGRITY
-- Measures: Consistency, accountability, ethical decision-making
-- 12 Likert (5 reverse, 2 cross-loaded, 1 IM, 1 validity pair)
-- 5 Situational, 3 Forced Choice
-- ============================================================

-- INTEGRITY LIKERT
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'integrity_likert_01', 'integrity', NULL, 'likert',
  'When I make a promise to a client or team member, I follow through even when it costs me extra time or money.',
  NULL,
  '{"1": {"integrity": 0}, "2": {"integrity": 25}, "3": {"integrity": 50}, "4": {"integrity": 75}, "5": {"integrity": 100}}',
  0.4, false, 'integrity_vp_01', false, '{quick,deep}'
),
(
  'integrity_likert_02', 'integrity', NULL, 'likert',
  'When I make a mistake that affects my team, I own it publicly rather than minimizing it.',
  NULL,
  '{"1": {"integrity": 0}, "2": {"integrity": 25}, "3": {"integrity": 50}, "4": {"integrity": 75}, "5": {"integrity": 100}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'integrity_likert_03', 'integrity', NULL, 'likert',
  'I apply the same standards to my own work that I expect from my team.',
  NULL,
  '{"1": {"integrity": 0}, "2": {"integrity": 25}, "3": {"integrity": 50}, "4": {"integrity": 75}, "5": {"integrity": 100}}',
  0.35, false, NULL, false, '{quick,deep}'
),
(
  'integrity_likert_04', 'integrity', NULL, 'likert',
  'In the last month, I have turned down a shortcut that would have saved time but compromised quality.',
  NULL,
  '{"1": {"integrity": 0}, "2": {"integrity": 25}, "3": {"integrity": 50}, "4": {"integrity": 75}, "5": {"integrity": 100}}',
  0.55, false, NULL, false, '{quick,deep}'
),
-- INTEGRITY LIKERT (cross-loaded: integrity + connection)
(
  'integrity_likert_05', 'integrity', 'connection', 'likert',
  'I give honest feedback to my team members even when it would be easier to say nothing.',
  NULL,
  '{"1": {"integrity": 0, "connection": 0}, "2": {"integrity": 17.5, "connection": 7.5}, "3": {"integrity": 35, "connection": 15}, "4": {"integrity": 52.5, "connection": 22.5}, "5": {"integrity": 70, "connection": 30}}',
  0.5, false, NULL, false, '{quick,deep}'
),
-- INTEGRITY LIKERT (cross-loaded: integrity + drive — Operator differentiation)
(
  'integrity_likert_06', 'integrity', 'drive', 'likert',
  'I finish every task I commit to, even the boring ones, because my word matters more than my comfort.',
  NULL,
  '{"1": {"integrity": 0, "drive": 0}, "2": {"integrity": 17.5, "drive": 7.5}, "3": {"integrity": 35, "drive": 15}, "4": {"integrity": 52.5, "drive": 22.5}, "5": {"integrity": 70, "drive": 30}}',
  0.5, false, NULL, false, '{quick,deep}'
),
-- INTEGRITY LIKERT (impression management)
(
  'integrity_likert_07', 'integrity', NULL, 'likert',
  'I always consider every perspective before making any decision, without exception.',
  NULL,
  '{"1": {"integrity": 0}, "2": {"integrity": 25}, "3": {"integrity": 50}, "4": {"integrity": 75}, "5": {"integrity": 100}}',
  0.85, false, NULL, true, '{quick,deep}'
),
-- INTEGRITY LIKERT (reverse-scored)
(
  'integrity_likert_08', 'integrity', NULL, 'likert',
  'When no one is watching, I sometimes cut corners to get things done faster.',
  NULL,
  '{"1": {"integrity": 100}, "2": {"integrity": 75}, "3": {"integrity": 50}, "4": {"integrity": 25}, "5": {"integrity": 0}}',
  0.35, true, NULL, false, '{quick,deep}'
),
(
  'integrity_likert_09', 'integrity', NULL, 'likert',
  'I have taken credit for a team accomplishment without fully acknowledging everyone who contributed.',
  NULL,
  '{"1": {"integrity": 100}, "2": {"integrity": 75}, "3": {"integrity": 50}, "4": {"integrity": 25}, "5": {"integrity": 0}}',
  0.45, true, NULL, false, '{quick,deep}'
),
(
  'integrity_likert_10', 'integrity', NULL, 'likert',
  'I sometimes tell clients what they want to hear rather than what they need to hear.',
  NULL,
  '{"1": {"integrity": 100}, "2": {"integrity": 75}, "3": {"integrity": 50}, "4": {"integrity": 25}, "5": {"integrity": 0}}',
  0.5, true, NULL, false, '{quick,deep}'
),
(
  'integrity_likert_11', 'integrity', NULL, 'likert',
  'When rules or policies slow things down, I sometimes bend them to keep progress moving.',
  NULL,
  '{"1": {"integrity": 100}, "2": {"integrity": 75}, "3": {"integrity": 50}, "4": {"integrity": 25}, "5": {"integrity": 0}}',
  0.5, true, NULL, false, '{deep}'
),
-- INTEGRITY LIKERT (validity pair partner + reverse)
(
  'integrity_likert_12', 'integrity', NULL, 'likert',
  'There have been times when I did not fully deliver on a commitment because something more urgent came up.',
  NULL,
  '{"1": {"integrity": 100}, "2": {"integrity": 75}, "3": {"integrity": 50}, "4": {"integrity": 25}, "5": {"integrity": 0}}',
  0.4, true, 'integrity_vp_01', false, '{deep}'
);

-- INTEGRITY SITUATIONAL
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'integrity_situational_01', 'integrity', NULL, 'situational',
  'You discover that your team has been using a workaround that technically violates a safety guideline but saves two hours per day. What do you do?',
  '[
    {"key": "a", "text": "Stop the workaround immediately and retrain the team on the proper procedure", "scores": {"integrity": 85, "resilience": 40}},
    {"key": "b", "text": "Report the issue to leadership and propose a compliant alternative that still saves time", "scores": {"integrity": 75, "vision": 60}},
    {"key": "c", "text": "Allow the workaround to continue while you research whether the guideline is outdated", "scores": {"integrity": 25, "adaptability": 55}},
    {"key": "d", "text": "Discuss the situation openly with the team to understand why they made that choice", "scores": {"integrity": 55, "connection": 65}}
  ]',
  '{"a": {"integrity": 85, "resilience": 40}, "b": {"integrity": 75, "vision": 60}, "c": {"integrity": 25, "adaptability": 55}, "d": {"integrity": 55, "connection": 65}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'integrity_situational_02', 'integrity', NULL, 'situational',
  'A client asks you to rush a job and offers a bonus, but you know the quality will suffer. How do you respond?',
  '[
    {"key": "a", "text": "Decline the rush and explain the quality risks honestly", "scores": {"integrity": 85, "connection": 45}},
    {"key": "b", "text": "Accept the rush but clearly document that quality standards may not be fully met", "scores": {"integrity": 60, "drive": 55}},
    {"key": "c", "text": "Negotiate a middle ground with a slightly extended timeline that preserves core quality", "scores": {"integrity": 70, "adaptability": 55}},
    {"key": "d", "text": "Take the job and put in extra hours yourself to maintain quality", "scores": {"integrity": 50, "drive": 75}}
  ]',
  '{"a": {"integrity": 85, "connection": 45}, "b": {"integrity": 60, "drive": 55}, "c": {"integrity": 70, "adaptability": 55}, "d": {"integrity": 50, "drive": 75}}',
  0.55, false, NULL, false, '{quick,deep}'
),
(
  'integrity_situational_03', 'integrity', NULL, 'situational',
  'You realize after submitting an invoice that you accidentally overcharged a client by a small amount. They have already paid without noticing. What do you do?',
  '[
    {"key": "a", "text": "Issue a credit immediately and let the client know about the error", "scores": {"integrity": 90, "connection": 50}},
    {"key": "b", "text": "Adjust the next invoice to balance it out without bringing it up", "scores": {"integrity": 55, "adaptability": 45}},
    {"key": "c", "text": "Leave it since the amount is small and not worth the administrative hassle", "scores": {"integrity": 15, "drive": 40}},
    {"key": "d", "text": "Correct it internally and add controls to prevent it from happening again", "scores": {"integrity": 70, "vision": 55}}
  ]',
  '{"a": {"integrity": 90, "connection": 50}, "b": {"integrity": 55, "adaptability": 45}, "c": {"integrity": 15, "drive": 40}, "d": {"integrity": 70, "vision": 55}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'integrity_situational_04', 'integrity', NULL, 'situational',
  'A vendor you rely on offers you a personal discount in exchange for recommending them exclusively to your clients. How do you handle it?',
  '[
    {"key": "a", "text": "Decline the offer because it creates a conflict of interest", "scores": {"integrity": 85, "resilience": 50}},
    {"key": "b", "text": "Accept the discount but continue recommending vendors based on merit", "scores": {"integrity": 40, "adaptability": 45}},
    {"key": "c", "text": "Disclose the offer to your clients and let them decide", "scores": {"integrity": 75, "connection": 60}},
    {"key": "d", "text": "Negotiate a discount that benefits your clients instead of you personally", "scores": {"integrity": 70, "vision": 55}}
  ]',
  '{"a": {"integrity": 85, "resilience": 50}, "b": {"integrity": 40, "adaptability": 45}, "c": {"integrity": 75, "connection": 60}, "d": {"integrity": 70, "vision": 55}}',
  0.65, false, NULL, false, '{deep}'
),
(
  'integrity_situational_05', 'integrity', NULL, 'situational',
  'You promised your team a day off after a big project, but a new urgent request just came in from a top client. What do you do?',
  '[
    {"key": "a", "text": "Honor the day off and handle the client request yourself or find another solution", "scores": {"integrity": 80, "drive": 55}},
    {"key": "b", "text": "Ask for volunteers to help with the client request and offer extra compensation", "scores": {"integrity": 65, "connection": 65}},
    {"key": "c", "text": "Cancel the day off and explain that client needs come first", "scores": {"integrity": 30, "drive": 70}},
    {"key": "d", "text": "Negotiate with the client for a deadline that allows the team to take their day off first", "scores": {"integrity": 75, "adaptability": 55}}
  ]',
  '{"a": {"integrity": 80, "drive": 55}, "b": {"integrity": 65, "connection": 65}, "c": {"integrity": 30, "drive": 70}, "d": {"integrity": 75, "adaptability": 55}}',
  0.6, false, NULL, false, '{deep}'
);

-- INTEGRITY FORCED CHOICE
INSERT INTO question_pool (id, dimension, secondary_dimension, type, text, options, scoring_weights, difficulty, reverse_scored, validity_pair_id, is_impression_management, version_availability)
VALUES
(
  'integrity_forced_01', 'integrity', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I would rather deliver exactly what I promised, even if it means missing a bigger opportunity.", "scores": {"integrity": 80, "resilience": 35}},
    {"key": "b", "text": "I would rather adapt my commitments when a clearly better opportunity comes along.", "scores": {"integrity": 30, "adaptability": 80}}
  ]',
  '{"a": {"integrity": 80, "resilience": 35}, "b": {"integrity": 30, "adaptability": 80}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'integrity_forced_02', 'integrity', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I believe consistency and keeping your word is the foundation of good leadership.", "scores": {"integrity": 80, "connection": 40}},
    {"key": "b", "text": "I believe flexibility and being willing to change direction is the foundation of good leadership.", "scores": {"integrity": 30, "adaptability": 75}}
  ]',
  '{"a": {"integrity": 80, "connection": 40}, "b": {"integrity": 30, "adaptability": 75}}',
  0.5, false, NULL, false, '{quick,deep}'
),
(
  'integrity_forced_03', 'integrity', NULL, 'forced_choice',
  'Which statement describes you better?',
  '[
    {"key": "a", "text": "I would rather be known as someone who always does things by the book.", "scores": {"integrity": 80, "drive": 30}},
    {"key": "b", "text": "I would rather be known as someone who always finds a way to get things done.", "scores": {"integrity": 30, "drive": 80}}
  ]',
  '{"a": {"integrity": 80, "drive": 30}, "b": {"integrity": 30, "drive": 80}}',
  0.45, false, NULL, false, '{deep}'
);
