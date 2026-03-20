-- Input validation constraints for web submissions
-- Prevents abuse: oversized fields, invalid eras, too many media URLs

ALTER TABLE memories
  ADD CONSTRAINT chk_author_name_length
    CHECK (char_length(author_name) <= 100);

ALTER TABLE memories
  ADD CONSTRAINT chk_content_length
    CHECK (content IS NULL OR char_length(content) <= 20000);

ALTER TABLE memories
  ADD CONSTRAINT chk_media_urls_count
    CHECK (array_length(media_urls, 1) IS NULL OR array_length(media_urls, 1) <= 10);

ALTER TABLE memories
  ADD CONSTRAINT chk_era_values
    CHECK (era IS NULL OR era IN ('player', 'post-grad', 'colleague', 'family'));
