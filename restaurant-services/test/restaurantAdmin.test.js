const app = require("../app");
const request = require("supertest");

describe("Restaurant services", function () {
  test("should give response with status code 201 when signed up", async () => {
    const response = await request(app).post("/restaurantAdmin/signup").send({
      email: "testRestaurantAdmin0@gmail.com",
      password: "12345",
      name: "testRestaurantAdmin0",
    });
    expect(response.statusCode).toBe(201);
  }, 30000);

  test("should give response with status code 201 when logged in with existing email id", async () => {
    const response = await request(app).post("/restaurantAdmin/login").send({
      email: "roshan1@gmail.com",
      password: "12345",
      name: "Roshan1",
    });
    expect(response.statusCode).toBe(200);
  }, 30000);

  test("should give ewrror with status code 401 when we try to add food without logging in", async () => {
    const response = await request(app).post("/restaurantAdmin/food").send({
      name: "test",
      imageUrl: "tester123",
      price: 10,
      description: "unit test",
      restaurantId: "5c0f66b979af55031b34728c",
      availability: "available",
      restaurantAdminId: "5c0f66b979af55031b34728a",
    });
    expect(response.statusCode).toBe(401);
  }, 30000);
});
