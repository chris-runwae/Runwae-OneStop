-- ================================================================
-- Seed: content tables
-- Run AFTER migration 20260402000000_content_tables.sql
-- Safe to re-run (ON CONFLICT DO NOTHING).
-- ================================================================

-- ----------------------------------------------------------------
-- DESTINATIONS
-- ----------------------------------------------------------------
INSERT INTO public.destinations (id, title, location, image, rating, review_count, description, featured)
VALUES
(
  'd1000000-0000-0000-0000-000000000001',
  'Accra', 'Accra, Ghana',
  'https://images.unsplash.com/photo-1591122731590-76192135043f?w=600',
  4.8, 320,
  'Uncover the wonders of Accra! Immerse yourself in its captivating history and dynamic culture. Wander through the energetic Makola Market, delve into the traditional crafts at the Centre for National Culture, and relax on the beautiful beaches. From the historic Jamestown district to the modern developments of Airport City, Accra offers a unique blend of old and new that will leave you wanting more.',
  false
),
(
  'd1000000-0000-0000-0000-000000000002',
  'Wine under the mountains', 'Cape Town, South Africa',
  'https://images.unsplash.com/photo-1580060839134-75a5edca2e99?w=600',
  4.7, 156,
  'Experience the world-renowned wineries of Cape Town, set against the backdrop of stunning mountain ranges. Enjoy tastings, cellar tours, and exquisite dining in the heart of the Winelands.',
  false
),
(
  'd1000000-0000-0000-0000-000000000003',
  'Romantic canals', 'Venice, Italy',
  'https://images.unsplash.com/photo-1514890547357-a9ee288728e0?w=600',
  4.9, 428,
  'Venture through the narrow streets and iconic canals of Venice. Experience the charm of Gondola rides, historic landmarks, and exquisite Italian cuisine in one of the world''s most romantic cities.',
  false
),
(
  'd1000000-0000-0000-0000-000000000004',
  'The Heart of the Alps', 'Innsbruck, Austria',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600',
  null, 0, null, true
),
(
  'd1000000-0000-0000-0000-000000000005',
  'Mystical Zen Gardens', 'Kyoto, Japan',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
  null, 0, null, true
),
(
  'd1000000-0000-0000-0000-000000000006',
  'Eternal Blue Vistas', 'Santorini, Greece',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600',
  null, 0, null, true
)
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------
-- EXPERIENCES
-- ----------------------------------------------------------------
INSERT INTO public.experiences
  (id, title, category, rating, review_count, description, image, gallery, price, featured, included, what_to_know, itinerary)
VALUES
-- 1. Miami Sunset Cocktail Cruise
(
  'e1000000-0000-0000-0000-000000000001',
  'Exclusive Miami Sunset and City Lights Luxury Cocktail Cruise',
  'Food', 4.5, 450,
  'Immerse yourself in a beautiful evening with a cocktail cruise. Enjoy the sunset and city lights as you sip on our signature cocktails. Perfect for a romantic evening or a relaxing night out with friends.',
  'https://images.unsplash.com/photo-1548115184-bc6544d06a58?w=600',
  '["https://images.unsplash.com/photo-1544526226-d45680d0739f?w=600","https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=600","https://images.unsplash.com/photo-1518115392437-080168471e82?w=600","https://images.unsplash.com/photo-1543160732-cf85659b7815?w=600","https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600","https://images.unsplash.com/photo-1502444330042-d1a1ddf9bb56?w=600"]'::jsonb,
  120, false,
  '[{"title":"Complimentary Signature Cocktails"},{"title":"Luxury Yacht Access"},{"title":"Live Music Performance"},{"title":"Expert Local Commentary"}]'::jsonb,
  '[{"icon":"clock","title":"Duration","description":"A 2-hour cruise through the bays of Miami."},{"icon":"user","title":"Guest Policy","description":"Open to all ages, though alcohol is 21+ only."},{"icon":"wind","title":"Weather Info","description":"Tours may be rescheduled in case of severe weather."},{"icon":"users","title":"Accessibility","description":"The yacht is wheelchair accessible with advance notice."},{"icon":"map-pin","title":"Parking","description":"Limited parking at marina; rideshare suggested."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1544526226-d45680d0739f?w=600","title":"Marina Boarding","description":"Welcome drink upon boarding at the luxury marina."},{"image":"https://images.unsplash.com/photo-1534067783941-51c9c23eccfd?w=600","title":"Skyline Sunset","description":"Panoramic views as the sun dips below the horizon."},{"image":"https://images.unsplash.com/photo-1518115392437-080168471e82?w=600","title":"Cocktails & Music","description":"Handcrafted drinks while mingling with fellow guests."},{"image":"https://images.unsplash.com/photo-1543160732-cf85659b7815?w=600","title":"City Lights Tour","description":"See the Miami skyline illuminate as night falls."},{"image":"https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600","title":"Marina Return","description":"Smooth sail back to conclude the evening."}]'::jsonb
),
-- 2. Jazz & Wine Tasting
(
  'e1000000-0000-0000-0000-000000000002',
  'Premium Live Jazz and Exclusive Wine Tasting Night Experience',
  'Culture', 4.8, 320,
  'Immerse yourself in a night of fantastic jazz music and wine pairing delights. Discover new flavors as our expert sommeliers guide you through a curated selection of fine wines perfectly matched with light bites.',
  'https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600',
  '["https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600","https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600","https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600","https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600","https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600","https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600"]'::jsonb,
  80, false,
  '[{"title":"VIP Seating"},{"title":"Selection of 5 Premium Wines"},{"title":"Artisan Cheese & Charcuterie"},{"title":"Professional Sommelier Guide"}]'::jsonb,
  '[{"icon":"music","title":"Atmosphere","description":"Sophisticated jazz lounge setting."},{"icon":"user-check","title":"Dress Code","description":"Smart casual is required for entry."},{"icon":"alert-octagon","title":"Age Limit","description":"This event is strictly for guests aged 21 and over."},{"icon":"users","title":"Group Bookings","description":"Discounts available for groups of 6 or more."},{"icon":"clock","title":"Arrival Time","description":"Please arrive at least 15 minutes before the start."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1511192336575-5a79af67a629?w=600","title":"Opening Set","description":"Smooth evening jazz to set the mood."},{"image":"https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600","title":"Sommelier Intro","description":"Brief talk on the evening''s wine selection."},{"image":"https://images.unsplash.com/photo-1560275619-4662e36fa65c?w=600","title":"First Pour","description":"Enjoy the first wine with a matched appetizer."},{"image":"https://images.unsplash.com/photo-1582967788606-a171c1080cb0?w=600","title":"Main Jazz Set","description":"The band takes the stage for their performance."},{"image":"https://images.unsplash.com/photo-1551244072-5d12893278ab?w=600","title":"Digestif","description":"Conclude with a sweet treat and final tasting."}]'::jsonb
),
-- 3. Helicopter Tour
(
  'e1000000-0000-0000-0000-000000000003',
  'Private 30-Minute VIP Helicopter Tour of the Stunning Coastline',
  'Adventure', 4.9, 38,
  'See the stunning coastline from above in an unforgettable 30-minute helicopter ride. Take in breathtaking panoramic views of pristine beaches, dramatic cliffs, and crystal-clear waters from a unique vantage point.',
  'https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600',
  '["https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600","https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600","https://images.unsplash.com/photo-1620067925093-801122da1688?w=600","https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=600","https://images.unsplash.com/photo-1591154117099-0fac39b6b718?w=600","https://images.unsplash.com/photo-1560677353-c99026be15ea?w=600"]'::jsonb,
  250, false,
  '[{"title":"Private Helicopter Flight"},{"title":"Noise-Canceling Headsets"},{"title":"Pre-Flight Briefing"},{"title":"Digital Souvenir Photo"}]'::jsonb,
  '[{"icon":"camera","title":"Photo Opps","description":"Endless views of the shoreline perfect for photography."},{"icon":"activity","title":"Weight Limits","description":"Maximum weight per seat is 250 lbs for safety."},{"icon":"alert-circle","title":"Motion Sickness","description":"If sensitive, we recommend taking precautions."},{"icon":"file-text","title":"ID Required","description":"Valid photo identification must be presented."},{"icon":"users","title":"Children","description":"Children must be accompanied by an adult."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1518684079-3c830dcef090?w=600","title":"Liftoff","description":"Ascend from the helipad for an aerial tour."},{"image":"https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600","title":"Safety Briefing","description":"Essential safety instructions and headset fitting."},{"image":"https://images.unsplash.com/photo-1620067925093-801122da1688?w=600","title":"Coastal Cruise","description":"Fly over the most iconic beaches and cliffs."},{"image":"https://images.unsplash.com/photo-1546500840-ae38253aba9b?w=600","title":"Scenic Hover","description":"A brief hover at the most scenic point for photos."},{"image":"https://images.unsplash.com/photo-1591154117099-0fac39b6b718?w=600","title":"Landing","description":"Safe return to base and a chance to meet the pilot."}]'::jsonb
),
-- 4. Aurora Photography (featured)
(
  'e1000000-0000-0000-0000-000000000004',
  'Aurora Borealis Night Photography Tour with Expert Guide',
  'Photography', 4.9, 120,
  'Capture the ethereal beauty of the Northern Lights with professional guidance. We''ll take you to the best spots and help you dial in your camera settings for that perfect celestial shot.',
  'https://images.unsplash.com/photo-1483347756191-d5efbf27670e?w=600',
  '["https://images.unsplash.com/photo-1571839031920-f19956dfcd38?w=600","https://images.unsplash.com/photo-1541414779316-956a5084c0d4?w=600","https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=600","https://images.unsplash.com/photo-1510211334416-4919ff3a0e72?w=600","https://images.unsplash.com/photo-1524311583145-d3593002636a?w=600","https://images.unsplash.com/photo-1533470586079-24827adb828c?w=600"]'::jsonb,
  150, true,
  '[{"title":"DSLR Settings Guide"},{"title":"Night Photography Tutorial"},{"title":"Expert Navigator for Aurora Spotting"},{"title":"Warm Beverages & Snacks"}]'::jsonb,
  '[{"icon":"thermometer","title":"Attire","description":"Extreme cold weather gear is recommended."},{"icon":"eye","title":"Visibility","description":"Aurora visibility depends on weather and activity."},{"icon":"map-pin","title":"Pick-up","description":"Meeting point is at the city center hotel lobby."},{"icon":"activity","title":"Physical Level","description":"Low, mostly standing and short walks in snow."},{"icon":"briefcase","title":"Gear","description":"We provide thermal suits and tripods."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1483347756191-d5efbf27670e?w=600","title":"Equipment Setup","description":"Calibrating cameras for low-light conditions."},{"image":"https://images.unsplash.com/photo-1571839031920-f19956dfcd38?w=600","title":"Location Scout","description":"We head to the best spot based on clear skies."},{"image":"https://images.unsplash.com/photo-1541414779316-956a5084c0d4?w=600","title":"Aurora Watching","description":"Wait for the lights while enjoying hot drinks."},{"image":"https://images.unsplash.com/photo-1517511620798-cec17d428bc0?w=600","title":"Photo Coaching","description":"Hands-on help to capture the perfect aurora shot."},{"image":"https://images.unsplash.com/photo-1510211334416-4919ff3a0e72?w=600","title":"Arctic Return","description":"Journey back with a memory full of photos."}]'::jsonb
),
-- 5. Kaiseki Dining (featured)
(
  'e1000000-0000-0000-0000-000000000005',
  'Traditional Kaiseki Dining Experience in a Hidden Kyoto Gion',
  'Food', 5.0, 85,
  'Multi-course haute cuisine that balances taste, texture, and appearance. Experience the pinnacle of Japanese culinary art in an intimate, historic setting.',
  'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600',
  '["https://images.unsplash.com/photo-1558818498-28c3e00ad465?w=600","https://images.unsplash.com/photo-1464306311821-582962a9ca64?w=600","https://images.unsplash.com/photo-1514333912423-e9b5ec1ff21d?w=600","https://images.unsplash.com/photo-1552590635-27c2c2128b15?w=600","https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=600","https://images.unsplash.com/photo-1464306311821-582962a9ca64?w=600"]'::jsonb,
  320, true,
  '[{"title":"12-Course Kaiseki Dinner"},{"title":"Private Dining Room"},{"title":"Tea Ceremony Introduction"},{"title":"Maiko Performance (Optional)"}]'::jsonb,
  '[{"icon":"info","title":"Etiquette","description":"Formal attire and shoe removal required."},{"icon":"utensils","title":"Dietary Needs","description":"Please inform us of allergies 48h early."},{"icon":"users","title":"Seating","description":"Traditional floor seating; leg space available."},{"icon":"volume-x","title":"Quietude","description":"Maintain a peaceful, respectful atmosphere."},{"icon":"camera","title":"Photography","description":"Discreet photography allowed; avoid flash."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=600","title":"Gion Walk","description":"Short guided walk through the historic district."},{"image":"https://images.unsplash.com/photo-1558818498-28c3e00ad465?w=600","title":"Seasonal Prelude","description":"First courses reflecting the current season."},{"image":"https://images.unsplash.com/photo-1464306311821-582962a9ca64?w=600","title":"Main Courses","description":"Fresh seafood at the heart of the Kaiseki meal."},{"image":"https://images.unsplash.com/photo-1514333912423-e9b5ec1ff21d?w=600","title":"Rice & Miso","description":"Traditional ritual towards the end of the meal."},{"image":"https://images.unsplash.com/photo-1552590635-27c2c2128b15?w=600","title":"Matcha Ceremony","description":"Conclude with a calming cup of whisked green tea."}]'::jsonb
),
-- 6. Hot Air Balloon (featured)
(
  'e1000000-0000-0000-0000-000000000006',
  'Sunrise Hot Air Balloon Ride Over Cappadocia''s Fairy Chimneys',
  'Adventure', 4.9, 412,
  'Float gently over the surreal landscapes of Cappadocia as the sun rises. A magical perspective of Turkey''s unique volcanic formations and ancient cave dwellings.',
  'https://images.unsplash.com/photo-1527838832700-505925240cff?w=600',
  '["https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=600","https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600","https://images.unsplash.com/photo-1534050359320-02900022671e?w=600","https://images.unsplash.com/photo-1516733729877-24760dc0cc14?w=600","https://images.unsplash.com/photo-1525097487452-6411ffdf6ad2?w=600","https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?w=600"]'::jsonb,
  280, true,
  '[{"title":"Sunrise Flight"},{"title":"Traditional Champagne Breakfast"},{"title":"Flight Certificate"},{"title":"Pickup from Hotel"}]'::jsonb,
  '[{"icon":"alert-circle","title":"Safety","description":"Subject to wind conditions. Safety first."},{"icon":"thermometer","title":"Morning Cold","description":"Dress warmly; it is chilly before sunrise."},{"icon":"clock","title":"Flight Time","description":"Actual flight time is approximately 60 minutes."},{"icon":"users","title":"Requirements","description":"Min age 6 years; must be at least 120cm tall."},{"icon":"refresh-cw","title":"Cancellation","description":"Full refund if grounded by the pilot."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1527838832700-505925240cff?w=600","title":"Inflation Watch","description":"See the massive balloons come to life at dawn."},{"image":"https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=600","title":"Lift Off","description":"Gently rise above the fairy chimneys as light breaks."},{"image":"https://images.unsplash.com/photo-1523906834658-6e24ef2386f9?w=600","title":"Grand Flight","description":"Drift across the valley for breathtaking panoramas."},{"image":"https://images.unsplash.com/photo-1534050359320-02900022671e?w=600","title":"Toast","description":"Soft landing followed by a champagne celebration."},{"image":"https://images.unsplash.com/photo-1516733729877-24760dc0cc14?w=600","title":"Certificates","description":"Receive your certificate before the hotel drop-off."}]'::jsonb
),
-- 7. Scuba Diving (featured)
(
  'e1000000-0000-0000-0000-000000000007',
  'Scuba Diving in Key Largo',
  'Diving', 4.9, 211,
  'Dive into the crystal-clear waters of Key Largo and explore vibrant coral reefs teeming with marine life. Perfect for both beginners and experienced divers, this underwater adventure offers an unforgettable glimpse into a hidden world of natural wonder.',
  'https://images.unsplash.com/photo-1544551763-47a012972986?w=600',
  '["https://images.unsplash.com/photo-1682687196011-04203ae355b2?w=600","https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600","https://images.unsplash.com/photo-1544551763-47a012972986?w=600","https://images.unsplash.com/photo-1629236209376-7ca656093144?w=600","https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600","https://images.unsplash.com/photo-1620067925093-801122da1688?w=600"]'::jsonb,
  200, true,
  '[{"title":"Hotel Pickup and Dropoff"},{"title":"All the equipments you need"},{"title":"1-1 Instructor"},{"title":"Personalized Itineraries Available"}]'::jsonb,
  '[{"icon":"users","title":"Requirements","description":"Open to all swimmers; no prior diving experience needed."},{"icon":"activity","title":"Activity Level","description":"Moderate activity; involves swimming and equipment handling."},{"icon":"life-buoy","title":"Safety First","description":"Fully certified instructors guide every step of the dive."},{"icon":"camera","title":"Underwater Photos","description":"GoPro rentals available for capturing your dive."},{"icon":"thermometer-snow","title":"Water Temp","description":"Wetsuits provided for a comfortable experience."}]'::jsonb,
  '[{"image":"https://images.unsplash.com/photo-1544551763-47a012972986?w=600","title":"Briefing","description":"Safety walk-through and equipment fitting at the center."},{"image":"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=600","title":"Boat Trip","description":"A scenic boat ride to the designated reef location."},{"image":"https://images.unsplash.com/photo-1544551763-47a012972986?w=600","title":"First Dive","description":"Descend into the reef for your first underwater scout."},{"image":"https://images.unsplash.com/photo-1629236209376-7ca656093144?w=600","title":"Marine Life","description":"Encounter tropical fish, turtles, and colorful corals."},{"image":"https://images.unsplash.com/photo-1502933691298-84fc14542831?w=600","title":"Surface Break","description":"Relax on board with snacks before the return trip."}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------
-- REVIEWS  (experiences)
-- ----------------------------------------------------------------
INSERT INTO public.reviews (entity_type, entity_id, name, username, avatar, rating, comment, review_date)
VALUES
-- Miami Cruise reviews
('experience', 'e1000000-0000-0000-0000-000000000001', 'Alex Rivera',   '@arivera',        'https://i.pravatar.cc/100?img=11', 5, 'The most beautiful way to see Miami. The cocktails were top notch!', '2 days ago'),
('experience', 'e1000000-0000-0000-0000-000000000001', 'Jessica W.',     '@jess_travels',   'https://i.pravatar.cc/100?img=5',  4, 'Beautiful boat and great service. The music was a bit loud but the view was worth it.', '5 days ago'),
('experience', 'e1000000-0000-0000-0000-000000000001', 'David Smith',    '@dsmith_miami',   'https://i.pravatar.cc/100?img=12', 5, 'Perfect for date night. The city lights from the water are incredible.', '1 week ago'),
('experience', 'e1000000-0000-0000-0000-000000000001', 'Maria L.',       '@marial',         'https://i.pravatar.cc/100?img=10', 5, 'Lovely experience. The staff was very attentive and the drinks were delicious.', '2 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000001', 'Ryan K.',        '@ryank',          'https://i.pravatar.cc/100?img=13', 4, 'Great value for money. A must-do if you''re in Miami for the weekend.', '1 month ago'),
-- Jazz & Wine reviews
('experience', 'e1000000-0000-0000-0000-000000000002', 'Elena G.',       '@elenag_tunes',   'https://i.pravatar.cc/100?img=20', 4, 'Great music, even better wine. Highly recommend for a relaxed night.', '5 days ago'),
('experience', 'e1000000-0000-0000-0000-000000000002', 'Marcus T.',      '@marcus_jazz',    'https://i.pravatar.cc/100?img=15', 5, 'An incredible evening. The sommelier really knew their stuff.', '1 week ago'),
('experience', 'e1000000-0000-0000-0000-000000000002', 'Sarah Jenkins',  '@sjenkins',       'https://i.pravatar.cc/100?img=22', 5, 'The atmosphere was electric! Best jazz club experience in the city.', '2 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000002', 'Leo P.',         '@leop',           'https://i.pravatar.cc/100?img=18', 4, 'Wonderful wine selection. I wish the set was a bit longer, but overall great.', '3 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000002', 'Nina R.',        '@ninar',          'https://i.pravatar.cc/100?img=25', 5, 'A sophisticated night out. The food pairings were spot on.', '1 month ago'),
-- Helicopter reviews
('experience', 'e1000000-0000-0000-0000-000000000003', 'Mark J.',        '@mark_adventures','https://i.pravatar.cc/100?img=33', 5, 'Absolutely breathtaking. Worth every penny!', '1 month ago'),
('experience', 'e1000000-0000-0000-0000-000000000003', 'Chris Evans',    '@cevans',         'https://i.pravatar.cc/100?img=32', 5, 'The pilot was great and the views of the coast were unmatched.', '2 months ago'),
('experience', 'e1000000-0000-0000-0000-000000000003', 'Sophie L.',      '@sophiel',        'https://i.pravatar.cc/100?img=30', 5, 'A once-in-a-lifetime experience. Highly professional staff.', '3 months ago'),
('experience', 'e1000000-0000-0000-0000-000000000003', 'Tom H.',         '@tomh',           'https://i.pravatar.cc/100?img=35', 4, 'Great tour! It was a bit short, but we saw a lot in 30 minutes.', '4 months ago'),
('experience', 'e1000000-0000-0000-0000-000000000003', 'Emma W.',        '@emmaw',          'https://i.pravatar.cc/100?img=31', 5, 'I''ve never seen the coastline like this before. Stunning!', '5 months ago'),
-- Aurora Photography reviews
('experience', 'e1000000-0000-0000-0000-000000000004', 'Lydia P.',       '@lp_photos',      'https://i.pravatar.cc/100?img=41', 5, 'The guide knew exactly where to go. Got some amazing shots!', '4 days ago'),
('experience', 'e1000000-0000-0000-0000-000000000004', 'Peter M.',       '@peterm',         'https://i.pravatar.cc/100?img=38', 5, 'A magical experience. The lights were so bright and vibrant.', '1 week ago'),
('experience', 'e1000000-0000-0000-0000-000000000004', 'Alice K.',       '@alicek',         'https://i.pravatar.cc/100?img=42', 5, 'Best photography tour I''ve ever been on. Very informative.', '2 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000004', 'James F.',       '@jamesf',         'https://i.pravatar.cc/100?img=40', 4, 'Incredible views. It was freezing cold, but worth the wait.', '3 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000004', 'Hannah S.',      '@hannahs',        'https://i.pravatar.cc/100?img=43', 5, 'Truly unforgettable. The aurora borealis is a must-see.', '1 month ago'),
-- Kaiseki Dining reviews
('experience', 'e1000000-0000-0000-0000-000000000005', 'Hiroshi K.',     '@hiro_foodie',    'https://i.pravatar.cc/100?img=52', 5, 'The most authentic meal I''ve ever had. Truly special.', '2 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000005', 'Yuki M.',        '@yukim',          'https://i.pravatar.cc/100?img=48', 5, 'Exceptional dining. The presentation was like a work of art.', '1 month ago'),
('experience', 'e1000000-0000-0000-0000-000000000005', 'Kenji T.',       '@kenjit',         'https://i.pravatar.cc/100?img=49', 5, 'A masterpiece of Japanese cuisine. Highly recommend.', '2 months ago'),
('experience', 'e1000000-0000-0000-0000-000000000005', 'Maya R.',        '@mayar',          'https://i.pravatar.cc/100?img=50', 5, 'The seasonal flavors were incredible. A must-visit in Kyoto.', '3 months ago'),
('experience', 'e1000000-0000-0000-0000-000000000005', 'Liam O.',        '@liamo',          'https://i.pravatar.cc/100?img=51', 5, 'Amazing food and wonderful service. A truly unforgettable night.', '4 months ago'),
-- Balloon Ride reviews
('experience', 'e1000000-0000-0000-0000-000000000006', 'Chloe M.',       '@chloe_sky',      'https://i.pravatar.cc/100?img=47', 5, 'Dream come true. Cappadocia looks unreal from above.', '1 day ago'),
('experience', 'e1000000-0000-0000-0000-000000000006', 'Lucas B.',       '@lucasb',         'https://i.pravatar.cc/100?img=46', 5, 'Breath-taking views. The sunrise was absolutely stunning.', '3 days ago'),
('experience', 'e1000000-0000-0000-0000-000000000006', 'Isabella S.',    '@isabellas',      'https://i.pravatar.cc/100?img=45', 5, 'Such a magical morning. Everything was so well-organized.', '1 week ago'),
('experience', 'e1000000-0000-0000-0000-000000000006', 'Oliver W.',      '@oliverw',        'https://i.pravatar.cc/100?img=44', 5, 'One of the best experiences of my life. A must-do in Turkey.', '2 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000006', 'Sophia L.',      '@sophial',        'https://i.pravatar.cc/100?img=41', 5, 'Simply amazing. The views were unforgettable.', '1 month ago'),
-- Scuba Diving reviews
('experience', 'e1000000-0000-0000-0000-000000000007', 'Samantha Cruz',  '@samantha.cruz',  'https://i.pravatar.cc/100?img=1',  4, 'Just enjoyed a stunning sunset on the Miami Sunset Cocktail Cruise! The colors in the sky were mesmerizing.', '3 days ago'),
('experience', 'e1000000-0000-0000-0000-000000000007', 'Michael Chen',   '@mchen.travels',  'https://i.pravatar.cc/100?img=3',  5, 'The best diving experience I''ve had in the Florida Keys. The reefs are incredibly vibrant and full of life!', '1 week ago'),
('experience', 'e1000000-0000-0000-0000-000000000007', 'Emily R.',       '@emilyr',         'https://i.pravatar.cc/100?img=4',  5, 'Key Largo has some of the best diving spots. This tour was top-notch.', '2 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000007', 'Jason B.',       '@jasonb',         'https://i.pravatar.cc/100?img=8',  5, 'Incredible marine life. Saw turtles, rays, and so many colorful fish.', '3 weeks ago'),
('experience', 'e1000000-0000-0000-0000-000000000007', 'Olivia K.',      '@oliviak',        'https://i.pravatar.cc/100?img=2',  5, 'A fantastic underwater adventure. Highly recommended for divers.', '1 month ago');


-- ----------------------------------------------------------------
-- EVENTS
-- ----------------------------------------------------------------
INSERT INTO public.events (id, title, location, date, time, category, image, latitude, longitude)
VALUES
('e0000000-0000-0000-0000-000000000001', 'Coachella 2026',      'Indio, California',     'April 26 - 28th 2026',    '12PM',   'MUSIC FEST', 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600',  33.680300, -116.236500),
('e0000000-0000-0000-0000-000000000002', 'Cherry Blossom',      'Tokyo, Japan',          'March 20 - April 10 2026','All Day', 'CULTURAL',   'https://images.unsplash.com/photo-1522383225653-ed111181a951?w=600',  35.689500,  139.691700),
('e0000000-0000-0000-0000-000000000003', 'Wimbledon Final',     'London, UK',            'July 12th 2026',          '2PM',    'SPORT',      'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=600',  51.434500,   -0.214500),
('e0000000-0000-0000-0000-000000000004', 'Burning Man',         'Black Rock City, NV',   'Aug 30 - Sep 7 2026',     'All Day', 'CULTURAL',  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600',  40.786400, -119.206500),
('e0000000-0000-0000-0000-000000000005', 'Tomorrowland',        'Boom, Belgium',         'July 17 - 19 2026',       '12PM',   'MUSIC FEST', 'https://images.unsplash.com/photo-1514525253361-bee24386b17b?w=600',  51.091100,    4.385500),
('e0000000-0000-0000-0000-000000000006', 'Super Bowl LX',       'Santa Clara, CA',       'Feb 8th 2026',            '3:30PM', 'SPORT',      'https://images.unsplash.com/photo-1454162272261-da491f71802b?w=600',  37.403300, -121.969400),
('e0000000-0000-0000-0000-000000000007', 'Taste of Chicago',    'Chicago, IL',           'July 8 - 12th 2026',      '11AM',   'FOOD',       'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600',  41.875700,  -87.624300),
('e0000000-0000-0000-0000-000000000008', 'Munich Oktoberfest',  'Munich, Germany',       'Sep 19 - Oct 4th 2026',   '10AM',   'FOOD',       'https://images.unsplash.com/photo-1555658636-6e4a3621464c?w=600',  48.131200,   11.549400),
('e0000000-0000-0000-0000-000000000009', 'Aspen Food & Wine',   'Aspen, CO',             'June 19 - 21st 2026',     '9AM',    'FOOD',       'https://images.unsplash.com/photo-1414235077428-33b07bd44c83?w=600',  39.191100, -106.817500)
ON CONFLICT (id) DO NOTHING;


-- ----------------------------------------------------------------
-- ITINERARY TEMPLATES
-- ----------------------------------------------------------------
INSERT INTO public.itinerary_templates
  (id, title, location, duration, category, image, rating, review_count, activities, description, featured, included, daily_itinerary)
VALUES
-- 1. New York
(
  'a0000000-0000-0000-0000-000000000001',
  'DITL: New York Edition!', 'New York, USA', '2 days', 'City Break',
  'https://images.unsplash.com/photo-1496442226666-8d4d0e62e6e9?w=600',
  4.9, 128, 7,
  'Explore New York''s iconic landmarks and hidden gems. From Central Park picnics to museum hopping, discover the city''s vibrant culture. Get ready for a laid-back adventure that captures the true essence of the Big Apple, all while discovering the city''s unique charm and energy.',
  false,
  '[{"icon":"hotel","title":"Hotel Pickup","subtitle":"We offer complimentary pickup from select hotels."},{"icon":"car","title":"Ground Transfers","subtitle":"Enjoy seamless transfers between locations."},{"icon":"ticket","title":"Funicular Tickets","subtitle":"Tickets for the Montmartre funicular are included."}]'::jsonb,
  '[{"day":1,"activities":[{"title":"Central Park Exploration","description":"Start your day with a peaceful stroll through Central Park, enjoying the scenic landscapes and perhaps stopping at a quiet bench to people-watch."},{"title":"Art Gallery Visit","description":"Explore a local art gallery in Chelsea, allowing yourself to immerse in contemporary art and perhaps engage in conversation with the artists."},{"title":"Brooklyn Bridge Walk","description":"Enjoy a picturesque walk across the Brooklyn Bridge, taking in stunning views of the Manhattan skyline as the sun begins to set."},{"title":"DUMBO Coffee Break","description":"Relax at a cozy cafe in DUMBO, sipping on your favorite brew while admiring the unique architecture and atmosphere of the area."}]},{"day":2,"activities":[{"title":"Statue of Liberty Ferry","description":"Take the ferry to Liberty Island and enjoy magnificent views of Lady Liberty and the harbor."},{"title":"High Line Park Walk","description":"Walk along the elevated park built on a historic freight rail line, featuring lush gardens and public art."},{"title":"Times Square at Night","description":"End your journey with the bright lights and bustling energy of Times Square."}]}]'::jsonb
),
-- 2. Bangkok
(
  'a0000000-0000-0000-0000-000000000002',
  'Temples & Street Food', 'Bangkok, Thailand', '4 days', 'Culture & Food',
  'https://images.unsplash.com/photo-1552465011-b4e21bf6e79a?w=600',
  4.7, 94, 12,
  'Experience the vibrant energy of Bangkok, from its majestic golden temples to the world-renowned street food scene. Immerse yourself in the local culture, navigate the bustling canals, and taste the authentic flavors of Thailand.',
  false,
  '[{"icon":"hotel","title":"Boutique Stay","subtitle":"Accommodation in a centrally located boutique hotel."},{"icon":"car","title":"Tuk-Tuk Tours","subtitle":"Local transport via traditional tuk-tuks for all tours."},{"icon":"ticket","title":"Entry Fees","subtitle":"Admission to the Grand Palace and major temples included."}]'::jsonb,
  '[{"day":1,"activities":[{"title":"Grand Palace Marvels","description":"Visit the spectacular Grand Palace and the Temple of the Emerald Buddha, marveling at the intricate architecture."},{"title":"River Canal Tour","description":"Explore the Venice of the East with a long-tail boat ride through Bangkok''s historic canals."}]},{"day":2,"activities":[{"title":"Street Food Safari","description":"Join a guided night tour through Yaowarat (Chinatown) to sample the city''s best street delicacies."}]},{"day":3,"activities":[{"title":"Floating Market Trip","description":"A day trip to the colorful Damnoen Saduak floating market to see local trade in action."}]},{"day":4,"activities":[{"title":"Thai Cooking Class","description":"Learn to cook classic Thai dishes like Pad Thai and Green Curry in a hands-on workshop."}]}]'::jsonb
),
-- 3. Tromsø
(
  'a0000000-0000-0000-0000-000000000003',
  'Northern Lights Hunt', 'Tromso, Norway', '6 days', 'Adventure',
  'https://images.unsplash.com/photo-1531366936337-7c912a4589a7?w=400',
  4.8, 61, 5,
  'Embark on an Arctic adventure in the heart of the aurora zone. Join expert guides as we chase the mystical Northern Lights across the stunning Norwegian landscape, combined with unique winter experiences.',
  false,
  '[{"icon":"hotel","title":"Arctic Lodge","subtitle":"Stay in a cozy lodge with prime aurora viewing decks."},{"icon":"car","title":"Chase Transport","subtitle":"Specially equipped vehicles for chasing the lights across borders."},{"icon":"ticket","title":"Gear Rental","subtitle":"Thermal suits and professional photography tripods provided."}]'::jsonb,
  '[{"day":1,"activities":[{"title":"Welcome to Tromso","description":"Arrival and evening briefing on how the Northern Lights occur and photography tips."}]},{"day":2,"activities":[{"title":"Husky Sledding","description":"Drive your own dog team through the snow-covered valleys of the Arctic north."},{"title":"Aurora Hunt #1","description":"Our first night chasing the lights with a campfire and local snacks."}]},{"day":3,"activities":[{"title":"Fjord Cruise","description":"A silent electric boat cruise through the breathtaking Arctic fjords."}]}]'::jsonb
),
-- 4. Merzouga
(
  'a0000000-0000-0000-0000-000000000004',
  'Desert Dunes & Stars', 'Merzouga, Morocco', '3 days', 'Adventure',
  'https://images.unsplash.com/photo-1509316785289-025f5b846b35?w=400',
  4.6, 43, 4,
  'Journey deep into the Sahara Desert for an unforgettable experience. Ride camels across the golden dunes of Erg Chebbi and spend a night under a canopy of a million stars in a traditional Berber camp.',
  false,
  '[{"icon":"hotel","title":"Luxury Camp","subtitle":"Night in a private tent with modern amenities in the dunes."},{"icon":"car","title":"4x4 Transfer","subtitle":"Rugged desert transport from the city to the dune base."},{"icon":"ticket","title":"Camel Trek","subtitle":"Sunset and sunrise camel rides through the Sahara."}]'::jsonb,
  '[{"day":1,"activities":[{"title":"Into the Sahara","description":"Departure in 4x4 vehicles towards the golden dunes of Merzouga."},{"title":"Sunset Camel Ride","description":"A peaceful trek across the dunes to watch the sun disappear over the horizon."}]},{"day":2,"activities":[{"title":"Berber Culture","description":"Visit a local nomadic family to learn about their traditions and enjoy Saharan tea."}]},{"day":3,"activities":[{"title":"Sunrise Peaks","description":"Early morning climb to the highest dune for a spectacular desert sunrise."}]}]'::jsonb
),
-- 5. Serengeti (featured)
(
  'a0000000-0000-0000-0000-000000000005',
  'Serengeti Safari Adventure', 'Serengeti, Tanzania', '7 days', 'Adventure',
  'https://images.unsplash.com/photo-1516426122078-c23e76319801?w=600',
  4.9, 245, 15,
  null,
  true,
  '[]'::jsonb,
  '[]'::jsonb
),
-- 6. Swiss Alps (featured)
(
  'a0000000-0000-0000-0000-000000000006',
  'Swiss Alps Hiking Trail', 'Zermatt, Switzerland', '5 days', 'Nature',
  'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600',
  4.8, 182, 10,
  null,
  true,
  '[]'::jsonb,
  '[]'::jsonb
),
-- 7. Santorini (featured)
(
  'a0000000-0000-0000-0000-000000000007',
  'Santorini Romance & Views', 'Oia, Greece', '3 days', 'Romance',
  'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=600',
  4.9, 310, 6,
  null,
  true,
  '[]'::jsonb,
  '[]'::jsonb
),
-- 8. Kyoto Heritage (featured)
(
  'a0000000-0000-0000-0000-000000000008',
  'Kyoto Heritage Tour', 'Kyoto, Japan', '4 days', 'Culture',
  'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=600',
  4.7, 156, 8,
  null,
  true,
  '[]'::jsonb,
  '[]'::jsonb
)
ON CONFLICT (id) DO NOTHING;
