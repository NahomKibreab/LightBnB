const { Pool } = require("pg");
const pool = new Pool({
  user: "vagrant",
  host: "localhost",
  database: "lightbnb",
  password: "123",
  port: 5432,
});

pool
  .connect()
  .then(() => console.log("DB connected!"))
  .catch((err) => console.log(err.stack));

const properties = require("./json/properties.json");
const users = require("./json/users.json");

/// Users

/**
 * Get a single user from the database given their email.
 * @param {String} email The email of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithEmail = function (email) {
  return pool
    .query(`SELECT * FROM users WHERE email = $1;`, [email])
    .then((result) => {
      if (result.rows[0].email.toLowerCase() === email.toLowerCase()) {
        return result.rows[0];
      } else {
        return null;
      }
    })
    .catch((err) => err.message);
};
exports.getUserWithEmail = getUserWithEmail;

/**
 * Get a single user from the database given their id.
 * @param {string} id The id of the user.
 * @return {Promise<{}>} A promise to the user.
 */
const getUserWithId = function (id) {
  return pool
    .query(`SELECT * FROM users WHERE id = $1`, [id])
    .then((result) => result.rows[0])
    .catch((err) => err.message);
};
exports.getUserWithId = getUserWithId;

/**
 * Add a new user to the database.
 * @param {{name: string, password: string, email: string}} user
 * @return {Promise<{}>} A promise to the user.
 */
const addUser = function (user) {
  return pool
    .query(
      `
    INSERT INTO users (name,email,password)
    VALUES ($1,$2,$3)
    RETURNING *;
  `,
      [user.name, user.email, user.password]
    )
    .then((result) => result.rows[0])
    .catch((err) => err.message);
};
exports.addUser = addUser;

/// Reservations

/**
 * Get all reservations for a single user.
 * @param {string} guest_id The id of the user.
 * @return {Promise<[{}]>} A promise to the reservations.
 */
const getAllReservations = function (guest_id, limit = 1) {
  return pool
    .query(
      `
    SELECT properties.*, avg(property_reviews.rating) as average_rating 
    FROM reservations
    JOIN properties ON reservations.property_id = properties.id
    JOIN property_reviews ON properties.id = reservations.property_id
    WHERE reservations.guest_id = $1 
    GROUP BY properties.id
    LIMIT $2;`,
      [guest_id, limit]
    )
    .then((result) => {
      return result.rows;
    })
    .catch((err) => console.log(err.message));
};
exports.getAllReservations = getAllReservations;

/// Properties

/**
 * Get all properties.
 * @param {{}} options An object containing query options.
 * @param {*} limit The number of results to return.
 * @return {Promise<[{}]>}  A promise to the properties.
 */
const getAllProperties = (options, limit = 10) => {
  if (Object.keys(options).length > 0) {
    // 1
    const queryParams = [];
    // 2
    let queryString = `
      SELECT properties.*, avg(property_reviews.rating) as average_rating
      FROM properties
      JOIN property_reviews ON properties.id = property_id
      `;

    // 3
    if (options.city) {
      queryParams.push(`%${options.city}%`);
      queryString += `WHERE city LIKE $${queryParams.length} `;
    }

    if (options.city && options.owner_id) {
      queryParams.push(options.owner_id);
      queryString += `AND owner_id = $${queryParams.length}`;
    } else if (options.owner_id) {
      queryParams.push(options.owner_id);
      queryString += `WHERE owner_id = $${queryParams.length}`;
    }

    if ((options.city || options.owner_id) && options.minimum_price_per_night) {
      queryParams.push(options.minimum_price_per_night * 100);
      queryString += `AND cost_per_night >= $${queryParams.length}`;
    } else if (options.minimum_price_per_night) {
      queryParams.push(options.minimum_price_per_night * 100);
      queryString += `WHERE cost_per_night >= $${queryParams.length}`;
    }

    if (
      (options.city || options.owner_id || options.minimum_price_per_night) &&
      options.maximum_price_per_night
    ) {
      queryParams.push(options.maximum_price_per_night * 100);
      queryString += `AND cost_per_night <= $${queryParams.length}`;
    } else if (options.maximum_price_per_night) {
      queryParams.push(options.maximum_price_per_night * 100);
      queryString += `WHERE cost_per_night <= $${queryParams.length}`;
    }

    if (options.minimum_rating) {
      queryParams.push(options.minimum_rating);
      queryString += `
      GROUP BY properties.id
      HAVING avg(property_reviews.rating) >= $${queryParams.length}
      ORDER BY cost_per_night
      `;
      // 4
      queryParams.push(limit);
      queryString += `
      LIMIT $${queryParams.length};
      `;
    } else {
      // 4
      queryParams.push(limit);
      queryString += `
      GROUP BY properties.id
      ORDER BY cost_per_night
      LIMIT $${queryParams.length};
      `;
    }

    // 5
    console.log(queryString, queryParams);

    // 6
    return pool
      .query(queryString, queryParams)
      .then((res) => res.rows)
      .catch((err) => console.log(err.message));
  }
  return pool
    .query(`SELECT * FROM properties LIMIT $1`, [limit])
    .then((result) => result.rows)
    .catch((err) => err.message);
};
exports.getAllProperties = getAllProperties;

/**
 * Add a property to the database
 * @param {{}} property An object containing all of the property details.
 * @return {Promise<{}>} A promise to the property.
 */
const addProperty = function (property) {
  const propertyId = Object.keys(properties).length + 1;
  property.id = propertyId;
  properties[propertyId] = property;
  return Promise.resolve(property);
};
exports.addProperty = addProperty;
