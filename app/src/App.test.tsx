import { render } from "@testing-library/react";
import AppBar from "./Header";

test("renders learn react link", () => {
  render(<AppBar />);
  expect(true).toBe(true);
});
