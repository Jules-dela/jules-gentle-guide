UPDATE cases 
SET status = 'visit_in_progress', updated_at = now()
WHERE id IN ('01f478a4-1985-4a09-8ed9-a6fa4165baf2', '3824317f-0384-4973-a749-4809cc325b41', 'ec68773c-fb46-4f30-bf3d-a96158d3d229')
AND status = 'proposals_available';