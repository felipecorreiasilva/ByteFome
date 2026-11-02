-- Inserindo lanches, acompanhamentos, bebidas e sobremesas no cardápio do ByteFome
INSERT INTO products (name, category, description, price, image_url, is_available) VALUES
-- Hambúrgueres
('Hambúrguer Clássico com Queijo', 'hamburgueres', 'Pão tradicional, blend de carne 150g, queijo prato e picles.', 24.90, '/uploads/products/Classic_Cheeseburger.jpg', TRUE),
('Smash Duplo com Bacon', 'hamburgueres', 'Pão brioche, 2 carnes smash de 90g, cheddar fatiado e bacon crocante.', 29.90, '/uploads/products/Smash_Duplo_com_Bacon.jpg', TRUE),
('Hambúrguer Especial Byte', 'hamburgueres', 'Pão australiano, blend 180g recheado com queijo cheddar cremoso e geleia de bacon.', 34.90, '/uploads/products/Hambúrguer_Especial_Byte.jpg', TRUE),
('Sanduíche de Frango Crocante', 'hamburgueres', 'Pão brioche, sobrecoxa empanada crocante, alface americana e maionese verde da casa.', 26.50, '/uploads/products/Sanduíche_de_Frango_Crocante.jpg', TRUE),
('Hambúrguer Vegetariano Supremo', 'hamburgueres', 'Pão integral, hambúrguer de grão-de-bico com aveia, alface, tomate e maionese vegana.', 25.00, '/uploads/products/Hambúrguer_Vegetariano_Supremo.jpg', TRUE),

-- Acompanhamentos
('Batata Frita Rústica', 'acompanhamentos', 'Porção de 250g com alecrim e páprica.', 16.90, '/uploads/products/Batata_Frita_Rústica.jpg', TRUE),
('Onion Rings (Anéis de Cebola)', 'acompanhamentos', 'Porção com 12 unidades de anéis de cebola empanados e crocantes.', 18.00, '/uploads/products/Onion_Rings.jpg', TRUE),
('Batata com Cheddar e Bacon', 'acompanhamentos', 'Porção de batatas fritas cobertas com cheddar cremoso e pedaços de bacon.', 22.90, '/uploads/products/Batata_com_Cheddar_e_Bacon.jpg', TRUE),

-- Bebidas
('Coca-Cola Original 350ml', 'bebidas', 'Lata de 350ml bem gelada.', 6.50, '/uploads/products/Coca-Cola Original 350ml.jpg', TRUE),
('Coca-Cola Zero 350ml', 'bebidas', 'Lata de 350ml zero açúcar.', 6.50, '/uploads/products/Coca-Cola Zero 350ml.jpg', TRUE),
('Suco Natural de Laranja 500ml', 'bebidas', 'Copo de 500ml de suco natural da fruta espremido na hora.', 9.00, '/uploads/products/Suco Natural de Laranja 500ml.jpg', TRUE),
('Água Mineral 500ml', 'bebidas', 'Garrafa de água mineral sem gás.', 4.50, '/uploads/products/Água Mineral 500ml.jpg', TRUE),

-- Sobremesas
('Milkshake de Chocolate', 'sobremesas', 'Milkshake cremoso de chocolate com chantilly e calda.', 14.90, '/uploads/products/Milkshake de Chocolate.jpg', TRUE);