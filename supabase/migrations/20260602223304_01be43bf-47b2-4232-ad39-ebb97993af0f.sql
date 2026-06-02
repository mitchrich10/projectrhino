UPDATE public.partnerships
SET redemption_url = replace(redemption_url, 'Rhino%20Ventures%20Partnership%20Inquiry', 'Rhino%20Portfolio%20Partnership%20Inquiry')
WHERE redemption_url LIKE 'mailto:%'
  AND redemption_url LIKE '%Rhino%20Ventures%20Partnership%20Inquiry%';