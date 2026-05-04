-- V2: seed categories and subcategories
-- 12 categories, 65 subcategories (spec said 60 but the listed data has 65).
-- displayOrder starts at 10 and increments by 10, leaving room for future inserts between rows.
-- Subcategories use subselects on category name so this migration is not sensitive to ID values.
-- File encoding: UTF-8 (required for Greek characters).

-- ──────────────────────────────────────────────────────────────────────────────
-- Categories
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO categories (name, type, display_order) VALUES ('ΕΣΟΔΑ',                       'INCOME',  10);
INSERT INTO categories (name, type, display_order) VALUES ('ΣΤΕΓΑΣΗ',                     'EXPENSE', 20);
INSERT INTO categories (name, type, display_order) VALUES ('ΔΙΑΣΚΕΔΑΣΗ',                  'EXPENSE', 30);
INSERT INTO categories (name, type, display_order) VALUES ('ΜΕΤΑΚΙΝΗΣΕΙΣ',                'EXPENSE', 40);
INSERT INTO categories (name, type, display_order) VALUES ('ΤΑΞΙΔΙΑ',                     'EXPENSE', 50);
INSERT INTO categories (name, type, display_order) VALUES ('ΑΣΦΑΛΕΙΑ',                    'EXPENSE', 60);
INSERT INTO categories (name, type, display_order) VALUES ('ΣΥΝΔΡΟΜΕΣ / ΔΙΑΦΟΡΑ ΤΕΛΗ',   'EXPENSE', 70);
INSERT INTO categories (name, type, display_order) VALUES ('ΑΠΟΤΑΜΙΕΥΣΕΙΣ Ή ΕΠΕΝΔΥΣΕΙΣ', 'EXPENSE', 80);
INSERT INTO categories (name, type, display_order) VALUES ('ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ',          'EXPENSE', 90);
INSERT INTO categories (name, type, display_order) VALUES ('SHOPLIST',                    'EXPENSE', 100);
INSERT INTO categories (name, type, display_order) VALUES ('ΔΩΡΑ ΚΑΙ ΔΩΡΕΕΣ',            'EXPENSE', 110);
INSERT INTO categories (name, type, display_order) VALUES ('ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ',          'EXPENSE', 120);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΕΣΟΔΑ (2)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Μισθός', (SELECT id FROM categories WHERE name = 'ΕΣΟΔΑ'), 10),
    ('Άλλο',   (SELECT id FROM categories WHERE name = 'ΕΣΟΔΑ'), 20);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΣΤΕΓΑΣΗ (8)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Στεγαστικό ή ενοίκιο',    (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 10),
    ('Τηλέφωνο',                 (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 20),
    ('Ηλεκτρικό',                (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 30),
    ('Αέριο',                    (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 40),
    ('Ύδρευση και αποχέτευση',   (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 50),
    ('Συνδρομητική τηλεόραση',   (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 60),
    ('Συντήρηση ή επισκευές',    (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 70),
    ('Άλλο',                     (SELECT id FROM categories WHERE name = 'ΣΤΕΓΑΣΗ'), 80);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΔΙΑΣΚΕΔΑΣΗ (8)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Εφημερίδα',           (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 10),
    ('Σινεμά',              (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 20),
    ('Συναυλίες',           (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 30),
    ('Αθλητικές εκδηλώσεις',(SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 40),
    ('Θέατρο',              (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 50),
    ('Stand Up Comedy',     (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 60),
    ('Στοίχημα',            (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 70),
    ('Άλλο',                (SELECT id FROM categories WHERE name = 'ΔΙΑΣΚΕΔΑΣΗ'), 80);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΜΕΤΑΚΙΝΗΣΕΙΣ (7)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Πάρκινγκ',                (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 10),
    ('Πλυντήριο αυτοκινήτων',   (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 20),
    ('ΜΜΜ/Ταξί',                (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 30),
    ('Καύσιμα',                 (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 40),
    ('Συντήρηση',               (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 50),
    ('Διόδια',                  (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 60),
    ('Άλλο',                    (SELECT id FROM categories WHERE name = 'ΜΕΤΑΚΙΝΗΣΕΙΣ'), 70);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΤΑΞΙΔΙΑ (7)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Μεταφορικά',       (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 10),
    ('Διαμονή',          (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 20),
    ('Φαγητό',           (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 30),
    ('Μουσεία',          (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 40),
    ('Αγορές ταξιδιού',  (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 50),
    ('Ποτά',             (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 60),
    ('Άλλο',             (SELECT id FROM categories WHERE name = 'ΤΑΞΙΔΙΑ'), 70);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΑΣΦΑΛΕΙΑ (5)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Σπιτιού',       (SELECT id FROM categories WHERE name = 'ΑΣΦΑΛΕΙΑ'), 10),
    ('Υγείας',        (SELECT id FROM categories WHERE name = 'ΑΣΦΑΛΕΙΑ'), 20),
    ('Ζωής',          (SELECT id FROM categories WHERE name = 'ΑΣΦΑΛΕΙΑ'), 30),
    ('Αυτοκινήτου',   (SELECT id FROM categories WHERE name = 'ΑΣΦΑΛΕΙΑ'), 40),
    ('Άλλο',          (SELECT id FROM categories WHERE name = 'ΑΣΦΑΛΕΙΑ'), 50);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΣΥΝΔΡΟΜΕΣ / ΔΙΑΦΟΡΑ ΤΕΛΗ (4)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Ακύρωση θεραπείας', (SELECT id FROM categories WHERE name = 'ΣΥΝΔΡΟΜΕΣ / ΔΙΑΦΟΡΑ ΤΕΛΗ'), 10),
    ('Spoofty family',    (SELECT id FROM categories WHERE name = 'ΣΥΝΔΡΟΜΕΣ / ΔΙΑΦΟΡΑ ΤΕΛΗ'), 20),
    ('Συνδρομή TPP',      (SELECT id FROM categories WHERE name = 'ΣΥΝΔΡΟΜΕΣ / ΔΙΑΦΟΡΑ ΤΕΛΗ'), 30),
    ('Άλλο',              (SELECT id FROM categories WHERE name = 'ΣΥΝΔΡΟΜΕΣ / ΔΙΑΦΟΡΑ ΤΕΛΗ'), 40);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΑΠΟΤΑΜΙΕΥΣΕΙΣ Ή ΕΠΕΝΔΥΣΕΙΣ (3)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Λογαριασμός συνταξιοδότησης', (SELECT id FROM categories WHERE name = 'ΑΠΟΤΑΜΙΕΥΣΕΙΣ Ή ΕΠΕΝΔΥΣΕΙΣ'), 10),
    ('Επενδυτικός λογαριασμός',     (SELECT id FROM categories WHERE name = 'ΑΠΟΤΑΜΙΕΥΣΕΙΣ Ή ΕΠΕΝΔΥΣΕΙΣ'), 20),
    ('Άλλο',                        (SELECT id FROM categories WHERE name = 'ΑΠΟΤΑΜΙΕΥΣΕΙΣ Ή ΕΠΕΝΔΥΣΕΙΣ'), 30);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ (5)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Σούπερ μάρκετ',       (SELECT id FROM categories WHERE name = 'ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ'), 10),
    ('Εστιατόρια/Delivery', (SELECT id FROM categories WHERE name = 'ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ'), 20),
    ('Μαγειρείο/Καφέδες',   (SELECT id FROM categories WHERE name = 'ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ'), 30),
    ('Ποτά',                (SELECT id FROM categories WHERE name = 'ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ'), 40),
    ('Άλλο',                (SELECT id FROM categories WHERE name = 'ΑΓΟΡΕΣ ΚΑΤΑΝΑΛΩΣΗΣ'), 50);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — SHOPLIST (5)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Tech',             (SELECT id FROM categories WHERE name = 'SHOPLIST'), 10),
    ('Βιβλία',           (SELECT id FROM categories WHERE name = 'SHOPLIST'), 20),
    ('Ρούχα/Παπούτσια',  (SELECT id FROM categories WHERE name = 'SHOPLIST'), 30),
    ('Video Games',       (SELECT id FROM categories WHERE name = 'SHOPLIST'), 40),
    ('Άλλο',             (SELECT id FROM categories WHERE name = 'SHOPLIST'), 50);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΔΩΡΑ ΚΑΙ ΔΩΡΕΕΣ (3)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Δώρα',      (SELECT id FROM categories WHERE name = 'ΔΩΡΑ ΚΑΙ ΔΩΡΕΕΣ'), 10),
    ('Λουλούδια', (SELECT id FROM categories WHERE name = 'ΔΩΡΑ ΚΑΙ ΔΩΡΕΕΣ'), 20),
    ('Άλλα',      (SELECT id FROM categories WHERE name = 'ΔΩΡΑ ΚΑΙ ΔΩΡΕΕΣ'), 30);

-- ──────────────────────────────────────────────────────────────────────────────
-- Subcategories — ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ (7)
-- ──────────────────────────────────────────────────────────────────────────────
INSERT INTO subcategories (name, category_id, display_order) VALUES
    ('Ιατρικά',               (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 10),
    ('Κομμωτήριο',            (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 20),
    ('Φαρμακείο',             (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 30),
    ('Στεγνοκαθαριστήριο',    (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 40),
    ('Γυμναστήριο',           (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 50),
    ('Φρύδια',                (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 60),
    ('Άλλο',                  (SELECT id FROM categories WHERE name = 'ΠΡΟΣΩΠΙΚΗ ΦΡΟΝΤΙΔΑ'), 70);
