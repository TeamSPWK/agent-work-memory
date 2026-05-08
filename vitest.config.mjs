export default {
  test: {
    environment: "node",
    pool: "forks",
    testTimeout: 10_000,
    hookTimeout: 15_000,
    include: ["tests/**/*.test.mjs"],
  },
};
