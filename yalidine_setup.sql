-- 1. Créer la table store_settings pour sauvegarder l'API ID et le Token
CREATE TABLE IF NOT EXISTS store_settings (
  key text PRIMARY KEY,
  value text NOT NULL
);

-- 2. Ajouter les colonnes de livraison à la table orders existante
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS wilaya text,
ADD COLUMN IF NOT EXISTS commune text,
ADD COLUMN IF NOT EXISTS address text,
ADD COLUMN IF NOT EXISTS yalidine_tracking text;
