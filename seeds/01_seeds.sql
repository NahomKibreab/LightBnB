INSERT INTO users (name,email,password) VALUES 
('Nahom','nknahom@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('Senai','senaikebreab@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.'),
('Alex','alexpatera@gmail.com','$2a$10$FB/BOAVhpuLvpOREQVmvmezD4ED/.JBIDRh70tGevYzYzQgFId2u.');

INSERT INTO properties (owner_id,title,description,thumbnail_photo_url,cover_photo_url,country,street,city,province,post_code) VALUES
(1,'Calgary House','description','#','#','Canada','123','Calgary','AB','123'),
(2,'Juba House','description','#','#','South Sudan','123','Juba','SS','123'),
(3,'Houston House','description','#','#','USA','123','Houston','TX','123');

INSERT INTO reservations (start_date,end_date,property_id,guest_id) VALUES
('2023-12-09','2023-12-12',1,1),
('2024-09-10','2024-01-13',2,2),
('2025-05-20','2025-07-25',3,3);

INSERT INTO property_reviews (guest_id,property_id,reservation_id,message) VALUES
(1,1,1,'message'),
(2,2,2,'message'),
(3,3,3,'message');