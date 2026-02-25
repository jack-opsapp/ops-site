-- Leadership Assessment — Archetype Profiles Seed
-- Generated: 2026-02-24
--
-- Upserts all 8 archetype profiles. Safe to re-run.
-- Run: psql $DATABASE_URL -f scripts/seed-archetypes.sql
--   or paste into Supabase SQL editor.

INSERT INTO archetype_profiles (id, name, tagline, ideal_scores, red_flags, description_template, strengths, blind_spots, growth_actions, compatible_with, tension_with)
VALUES

-- 1. The Anchor
(
  'the_anchor',
  'The Anchor',
  'Holds it together when things fall apart',
  '{"drive":55,"resilience":92,"vision":50,"connection":85,"adaptability":40,"integrity":40}'::jsonb,
  '{"drive":{"above":90},"connection":{"below":35},"resilience":{"below":40}}'::jsonb,
  E'When everything goes sideways \u2014 and it always does \u2014 you\'re the one who stays calm. Not because you don\'t feel the pressure, but because you\'ve learned that panic is contagious and composure is too. Your team looks to you not for the loudest voice, but for the steadiest one. You absorb the chaos so others can focus. That\'s not passive. That\'s the hardest kind of strength.',
  ARRAY['Unshakeable composure under pressure','Emotionally intelligent — reads and stabilizes the room','Creates psychological safety that unlocks honesty','Steady decision-making when stakes are highest'],
  ARRAY[E'You absorb other people\'s stress to keep the peace \u2014 and call it leadership when it\'s actually self-destruction',E'Your patience with underperformers looks like loyalty on the surface, but your top performers see it as unfairness',E'You mistake stability for progress \u2014 holding things together isn\'t the same as moving them forward',E'When you finally burn out, nobody sees it coming because you\'ve trained everyone to think you\'re unbreakable'],
  ARRAY[E'Name one thing this week you absorbed that wasn\'t yours to carry \u2014 then give it back to the person it belongs to',E'Have the conversation you\'ve been postponing because the timing never feels right. It won\'t get easier.',E'Set one goal this quarter that makes you uncomfortable \u2014 not one that stabilizes, one that disrupts'],
  ARRAY['the_operator','the_diplomat','the_driver'],
  ARRAY['the_catalyst','the_trailblazer','the_driver']
),

-- 2. The Architect
(
  'the_architect',
  'The Architect',
  'Designs the blueprint others build on',
  '{"drive":38,"resilience":65,"vision":92,"connection":55,"adaptability":35,"integrity":88}'::jsonb,
  '{"vision":{"below":40},"integrity":{"below":35},"connection":{"above":85}}'::jsonb,
  E'You lead with foresight and principle. Where others see chaos, you see systems waiting to be designed. Your strength is building frameworks that outlast any single project \u2014 structures that guide teams long after you\'ve moved on. You don\'t just plan; you architect outcomes. Your decisions are rooted in conviction, and your team trusts you because your standards never shift based on convenience.',
  ARRAY['Systems thinking that sees the whole picture','Principled decision-making under pressure','Long-range strategic planning','Building frameworks others can follow'],
  ARRAY[E'You spend so long designing the perfect system that the opportunity it was built for has already passed',E'You dismiss input from people who think differently \u2014 not because they\'re wrong, but because their ideas don\'t fit your framework',E'Your need for structural clarity can feel like control to people who thrive in ambiguity',E'You confuse having a plan with being prepared \u2014 the best plans don\'t survive first contact with reality'],
  ARRAY[E'Ship something this week that\'s 80% ready. Notice how the world doesn\'t end.',E'Ask your least strategic team member what they think about a problem you\'re stuck on. Listen without correcting.',E'Identify one framework you\'re defending out of pride rather than evidence \u2014 and kill it'],
  ARRAY['the_driver','the_operator','the_sage','the_catalyst'],
  ARRAY['the_trailblazer','the_catalyst']
),

-- 3. The Catalyst
(
  'the_catalyst',
  'The Catalyst',
  'Sparks the change others follow',
  '{"drive":88,"resilience":65,"vision":88,"connection":60,"adaptability":45,"integrity":55}'::jsonb,
  '{"drive":{"below":40},"vision":{"below":40},"integrity":{"above":85}}'::jsonb,
  E'You make things happen that weren\'t happening before. Not through force \u2014 through energy. You walk into a stalled project and something shifts. You articulate a future state so clearly that people want to run toward it. Your superpower isn\'t just having ideas \u2014 it\'s making other people believe in them badly enough to act. Momentum follows you like a shadow.',
  ARRAY['Generates momentum from nothing','Inspires action through vision and energy','Breaks through organizational inertia','Attracts and energizes talented people'],
  ARRAY[E'You spark fires you don\'t stick around to manage \u2014 the boring middle is where your ideas die',E'Your enthusiasm makes promises your calendar can\'t keep, and your team has learned to discount your commitments by 40%',E'You confuse generating energy with generating results \u2014 excitement without execution is just noise',E'You unconsciously devalue people who maintain things because you only respect people who start things'],
  ARRAY[E'Pick one initiative you started in the last 90 days and see it to completion before starting anything new',E'Write down every promise you make this week. At the end of the week, count how many you kept.',E'Stay engaged through one full project cycle \u2014 from spark to delivery \u2014 and resist the urge to hand it off'],
  ARRAY['the_driver','the_trailblazer','the_architect'],
  ARRAY['the_operator','the_anchor','the_architect','the_sage']
),

-- 4. The Diplomat
(
  'the_diplomat',
  'The Diplomat',
  'Builds the crew that builds the project',
  '{"drive":50,"resilience":58,"vision":55,"connection":92,"adaptability":85,"integrity":30}'::jsonb,
  '{"drive":{"above":90},"connection":{"below":40},"adaptability":{"below":35}}'::jsonb,
  E'You lead through people. Not in a soft, hand-holding way \u2014 in the way that actually gets crews to show up, buy in, and give a damn. You read rooms. You navigate conflict before it explodes. You build teams that trust each other because they trust you first. In a world that confuses leadership with volume, you prove that influence is quieter than authority \u2014 and more powerful.',
  ARRAY['Reads people and situations with precision','Builds high-trust teams that self-organize','Navigates conflict and competing interests','Adapts communication style to the audience'],
  ARRAY[E'Your ability to read the room has become an addiction to harmony \u2014 you optimize for comfort, not truth',E'You spread yourself across everyone\'s needs until there\'s nothing left for your own priorities',E'Your team likes you but doesn\'t always respect your decisions because they know you\'ll bend',E'You mistake avoiding conflict for managing it \u2014 the conversations you dodge become the crises you inherit'],
  ARRAY[E'Deliver one piece of hard feedback within 24 hours of when it\'s needed. Delaying makes it worse, not kinder.',E'Say no to one request this week that you\'d normally absorb. Notice that the relationship survives.',E'Make one unpopular decision without seeking consensus first. Observe whether the outcome is better or worse.'],
  ARRAY['the_anchor','the_sage','the_trailblazer'],
  ARRAY['the_driver','the_operator']
),

-- 5. The Driver
(
  'the_driver',
  'The Driver',
  'Forward is the only direction',
  '{"drive":92,"resilience":85,"vision":55,"connection":45,"adaptability":58,"integrity":35}'::jsonb,
  '{"drive":{"below":40},"connection":{"above":85},"resilience":{"below":35}}'::jsonb,
  E'You lead from the front. Output isn\'t a metric for you \u2014 it\'s a reflex. When things stall, you\'re the force that breaks through. Your team knows that with you at the helm, deadlines aren\'t suggestions and excuses don\'t fly. You set the pace, and the pace is relentless. What others call intense, you call Tuesday.',
  ARRAY['Relentless execution and follow-through','High accountability — for yourself and everyone around you','Thrives under pressure and tight deadlines','Bias toward action over analysis paralysis'],
  ARRAY[E'Your relentless pace creates a two-tier team: people who can keep up and people who are afraid to tell you they can\'t',E'You process stress through action \u2014 which means you never actually process it, you just outrun it',E'The things you dismiss as excuses are sometimes legitimate constraints you refuse to see',E'Your bias toward speed means you\'re consistently solving the wrong problem faster instead of the right problem carefully'],
  ARRAY[E'Before pushing harder on a stalled project, ask your team: "What do you need from me that you\'re not getting?"',E'Schedule two hours this week with nothing on the calendar. Sit with the discomfort of not producing.',E'Let someone else set the pace on one project. Observe whether the outcome suffers or if you just feel uncomfortable.'],
  ARRAY['the_architect','the_operator','the_catalyst','the_anchor'],
  ARRAY['the_diplomat','the_anchor','the_sage']
),

-- 6. The Operator
(
  'the_operator',
  'The Operator',
  'Runs it like a machine',
  '{"drive":82,"resilience":40,"vision":45,"connection":50,"adaptability":45,"integrity":90}'::jsonb,
  '{"drive":{"below":35},"integrity":{"below":40},"adaptability":{"above":85}}'::jsonb,
  E'You are the reason things actually work. Not the flashy vision, not the inspiring speech \u2014 the disciplined, repeatable execution that turns chaos into clockwork. You build processes that don\'t break. You hold standards that don\'t bend. Your team doesn\'t have to guess what\'s expected because you\'ve already made it clear, documented it, and held everyone to it \u2014 yourself first.',
  ARRAY['Builds reliable, repeatable systems','Holds standards consistently without exception','Discipline that earns respect, not resentment','Detail-oriented execution that catches what others miss'],
  ARRAY[E'Your obsession with consistency has become rigidity \u2014 you\'ve stopped asking whether the process still serves the purpose',E'You micromanage not because you don\'t trust people, but because the gap between "their way" and "the right way" makes your skin crawl',E'Your standards are so high that good people leave because they never feel good enough, and you tell yourself they just couldn\'t hack it',E'You\'ve confused your system with reality \u2014 when the map doesn\'t match the territory, you trust the map'],
  ARRAY[E'Ask your team this week: "What process of mine creates the most friction for you?" \u2014 and actually change it.',E'Let one team member run a project entirely their way. Judge only the outcome, not the method.',E'Identify one standard you\'re enforcing out of habit rather than necessity. Drop it for 30 days and measure the impact.'],
  ARRAY['the_architect','the_driver','the_anchor'],
  ARRAY['the_trailblazer','the_catalyst','the_diplomat']
),

-- 7. The Sage
(
  'the_sage',
  'The Sage',
  'Knowledge dies unshared',
  '{"drive":50,"resilience":35,"vision":58,"connection":88,"adaptability":25,"integrity":92}'::jsonb,
  '{"drive":{"above":90},"integrity":{"below":40},"connection":{"below":35}}'::jsonb,
  E'You play the long game. While others optimize for this quarter, you\'re developing the people who will lead next year. You teach, not because it\'s efficient, but because it\'s the only thing that compounds. Your team doesn\'t just perform under you \u2014 they grow. The leaders you develop become your legacy, and that matters more to you than any individual result.',
  ARRAY['Develops people who become leaders themselves','Builds culture that outlasts any single person','Leads with consistency and earned moral authority','Creates environments where people do their best work'],
  ARRAY[E'Your patience with development becomes an excuse for tolerating mediocrity \u2014 some people need accountability, not another coaching conversation',E'You invest so heavily in growing others that you neglect your own development and quietly stagnate',E'Your generosity creates dependency \u2014 people come to you for answers instead of building the muscle to find their own',E'You avoid directive leadership when the situation demands it because teaching feels safer than commanding'],
  ARRAY[E'Set one clear performance threshold this week where development stops and accountability starts. Hold it.',E'Block two hours for your own skill development \u2014 not reading about leadership, actually practicing something you\'re bad at.',E'The next time someone brings you a problem, ask three questions instead of giving the answer. If they still can\'t solve it, then direct.'],
  ARRAY['the_diplomat','the_architect','the_trailblazer'],
  ARRAY['the_driver','the_catalyst']
),

-- 8. The Trailblazer
(
  'the_trailblazer',
  'The Trailblazer',
  'Finds the path nobody else sees',
  '{"drive":40,"resilience":60,"vision":90,"connection":50,"adaptability":92,"integrity":55}'::jsonb,
  '{"vision":{"below":40},"integrity":{"above":90},"adaptability":{"below":35}}'::jsonb,
  E'You see around corners. While everyone else is solving today\'s problem, you\'re already three moves ahead, asking "why are we even doing it this way?" You challenge assumptions not to be difficult, but because you genuinely believe there\'s a better path \u2014 and you\'re usually right. Your team might not always understand your ideas immediately, but they\'ve learned to trust your instincts.',
  ARRAY['Sees opportunities others miss entirely','Comfortable with ambiguity and uncharted territory','Challenges assumptions that need challenging','Brings energy and excitement to new directions'],
  ARRAY[E'You chase novelty and call it innovation \u2014 half your "new directions" are abandoned before they prove anything',E'Your team has stopped getting excited about your ideas because they\'ve learned most won\'t survive the week',E'You dismiss proven methods not because they\'re wrong but because they bore you \u2014 and your team pays the price for your restlessness',E'You move so fast conceptually that your team can\'t follow, and you interpret their confusion as resistance instead of a failure to communicate'],
  ARRAY[E'For every new idea this week, write down what you\'ll STOP doing to make room for it. If you can\'t name something, the idea waits.',E'Partner with an Operator or Architect on your next initiative. Let them own the execution plan. Judge by results, not by whether it\'s exciting.',E'Finish one thing you abandoned in the last 90 days before starting anything new. The completion muscle needs exercise too.'],
  ARRAY['the_diplomat','the_catalyst','the_sage'],
  ARRAY['the_operator','the_architect','the_anchor']
)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  ideal_scores = EXCLUDED.ideal_scores,
  red_flags = EXCLUDED.red_flags,
  description_template = EXCLUDED.description_template,
  strengths = EXCLUDED.strengths,
  blind_spots = EXCLUDED.blind_spots,
  growth_actions = EXCLUDED.growth_actions,
  compatible_with = EXCLUDED.compatible_with,
  tension_with = EXCLUDED.tension_with;
