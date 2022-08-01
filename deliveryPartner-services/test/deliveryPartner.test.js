const app = require("../app");
const request = require("supertest");

const authMiddleware = require("../middleware/is-auth");

describe("Delivery partner service", function () {
  test("should throw an error if the token cannot be verified", () => {
    const req = {
      get: function (headerName) {
        return "Bearer xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).toThrow();
  });

  test("should throw an error if the authorization header is only one string", () => {
    const req = {
      get: function (headerName) {
        return "xyz";
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).toThrow();
  });

  test("should throw an error if no authorization header is present", () => {
    const req = {
      get: function (headerName) {
        return null;
      },
    };
    expect(authMiddleware.bind(this, req, {}, () => {})).toThrow();
  });

  test("should give response with status code 201 when signed up", async () => {
    const response = await request(app).post("/deliveryPartner/signup").send({
      email: "testdeliverypartner00@gmail.com",
      password: "12345",
      name: "testdeliverypartner00",
    });
    expect(response.statusCode).toBe(201);
  }, 30000);
});
