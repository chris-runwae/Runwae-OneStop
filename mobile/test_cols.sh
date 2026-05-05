for col in name label text activity_name idea_title title description; do
  RES=$(curl -s -X POST -H "apikey: sb_publishable_mqgg1s3ju01R7hEKMYq-0Q_ASYM8Ywl" -H "Authorization: Bearer sb_publishable_mqgg1s3ju01R7hEKMYq-0Q_ASYM8Ywl" -H "Content-Type: application/json" -H "Prefer: return=representation" -d "{\"$col\": \"test\"}" "https://zvicmujgveepxbekpzkf.supabase.co/rest/v1/saved_itinerary_items")
  echo "$col: $RES"
done
