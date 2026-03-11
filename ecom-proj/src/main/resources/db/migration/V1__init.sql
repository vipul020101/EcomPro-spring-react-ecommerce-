-- Initial schema for Postgres (enable Flyway via FLYWAY_ENABLED=true)

create table if not exists app_user (
  id bigserial primary key,
  name varchar(255) not null,
  email varchar(255) not null,
  password_hash varchar(255) not null,
  role varchar(32) not null,
  phone varchar(255),
  constraint uk_app_user_email unique (email)
);

create table if not exists product (
  id serial primary key,
  name varchar(255),
  description varchar(255),
  brand varchar(255),
  price numeric(19,2),
  rating numeric(3,2),
  category varchar(255),
  release_date date,
  available boolean not null default true,
  stock_quantity int not null default 0,
  image_name varchar(255),
  image_type varchar(255),
  image_data bytea
);

create table if not exists address (
  id bigserial primary key,
  user_id bigint not null,
  label varchar(255) not null,
  line1 varchar(255) not null,
  line2 varchar(255),
  city varchar(255) not null,
  state varchar(255) not null,
  postal_code varchar(255) not null,
  country varchar(255) not null,
  phone varchar(255),
  is_default boolean not null default false,
  constraint fk_address_user foreign key (user_id) references app_user(id) on delete cascade
);
create index if not exists ix_address_user_id on address(user_id);

create table if not exists wishlist_item (
  id bigserial primary key,
  user_id bigint not null,
  product_id int not null,
  created_at timestamptz not null,
  constraint fk_wishlist_user foreign key (user_id) references app_user(id) on delete cascade,
  constraint fk_wishlist_product foreign key (product_id) references product(id) on delete cascade,
  constraint uk_wishlist_user_product unique (user_id, product_id)
);
create index if not exists ix_wishlist_user_id on wishlist_item(user_id);
create index if not exists ix_wishlist_product_id on wishlist_item(product_id);

create table if not exists customer_order (
  id bigserial primary key,
  user_id bigint not null,
  created_at timestamptz not null,
  status varchar(32) not null,
  total numeric(12,2) not null,
  ship_label varchar(255) not null,
  ship_line1 varchar(255) not null,
  ship_line2 varchar(255),
  ship_city varchar(255) not null,
  ship_state varchar(255) not null,
  ship_postal_code varchar(255) not null,
  ship_country varchar(255) not null,
  ship_phone varchar(255),
  constraint fk_order_user foreign key (user_id) references app_user(id) on delete restrict
);
create index if not exists ix_customer_order_user_id on customer_order(user_id);
create index if not exists ix_customer_order_created_at on customer_order(created_at);

create table if not exists order_item (
  id bigserial primary key,
  order_id bigint not null,
  product_id int not null,
  product_name varchar(255) not null,
  unit_price numeric(12,2) not null,
  quantity int not null,
  constraint fk_order_item_order foreign key (order_id) references customer_order(id) on delete cascade
);
create index if not exists ix_order_item_order_id on order_item(order_id);

create table if not exists product_rating (
  id bigserial primary key,
  user_id bigint not null,
  product_id int not null,
  rating int not null,
  comment varchar(1000),
  created_at timestamptz not null,
  updated_at timestamptz not null,
  constraint fk_rating_user foreign key (user_id) references app_user(id) on delete cascade,
  constraint fk_rating_product foreign key (product_id) references product(id) on delete cascade,
  constraint uk_rating_user_product unique (user_id, product_id)
);
create index if not exists ix_rating_product_id on product_rating(product_id);
create index if not exists ix_rating_user_id on product_rating(user_id);