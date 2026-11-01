-- Inserindo lanches, acompanhamentos, bebidas e sobremesas no cardápio do ByteFome
INSERT INTO products (name, category, description, price, image_url, is_available) VALUES
-- Hambúrgueres
('Hambúrguer Clássico com Queijo', 'hamburgueres', 'Pão tradicional, blend de carne 150g, queijo prato e picles.', 24.90, 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=500', TRUE),
('Smash Duplo com Bacon', 'hamburgueres', 'Pão brioche, 2 carnes smash de 90g, cheddar fatiado e bacon crocante.', 29.90, 'https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=500', TRUE),
('Hambúrguer Especial Byte', 'hamburgueres', 'Pão australiano, blend 180g recheado com queijo cheddar cremoso e geleia de bacon.', 34.90, 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?w=500', TRUE),
('Sanduíche de Frango Crocante', 'hamburgueres', 'Pão brioche, sobrecoxa empanada crocante, alface americana e maionese verde da casa.', 26.50, 'https://images.unsplash.com/photo-1625813506062-0aeb1d7a094b?w=500', TRUE),
('Hambúrguer Vegetariano Supremo', 'hamburgueres', 'Pão integral, hambúrguer de grão-de-bico com aveia, alface, tomate e maionese vegana.', 25.00, 'https://images.unsplash.com/photo-1525059696034-4967a8e1dca2?w=500', TRUE),

-- Acompanhamentos
('Batata Frita Rústica', 'acompanhamentos', 'Porção de 250g com alecrim e páprica.', 16.90, 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=500', TRUE),
('Onion Rings (Anéis de Cebola)', 'acompanhamentos', 'Porção com 12 unidades de anéis de cebola empanados e crocantes.', 18.00, 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=500', TRUE),
('Batata com Cheddar e Bacon', 'acompanhamentos', 'Porção de batatas fritas cobertas com cheddar cremoso e pedaços de bacon.', 22.90, 'https://images.unsplash.com/photo-1585109649139-366815a0d713?w=500', TRUE),

-- Bebidas
('Coca-Cola Original 350ml', 'bebidas', 'Lata de 350ml bem gelada.', 6.50, 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=500', TRUE),
('Coca-Cola Zero 350ml', 'bebidas', 'Lata de 350ml zero açúcar.', 6.50, 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=500', TRUE),
('Suco Natural de Laranja 500ml', 'bebidas', 'Copo de 500ml de suco natural da fruta espremido na hora.', 9.00, 'https://images.unsplash.com/photo-1613478223719-2ab802602423?w=500', TRUE),
('Água Mineral 500ml', 'bebidas', 'Garrafa de água mineral sem gás.', 4.50, 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=500', TRUE),

-- Sobremesas
('Milkshake de Chocolate', 'sobremesas', 'Milkshake cremoso de chocolate com chantilly e calda.', 14.90, 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=500', TRUE);