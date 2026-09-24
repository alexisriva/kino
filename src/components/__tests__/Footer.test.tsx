import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { Footer } from "@/components/Footer";

describe("Footer", () => {
  it("renders the logo with correct attributes", () => {
    render(<Footer />);
    const logoImg = screen.getByAltText("KINO Logo");
    expect(logoImg).toBeInTheDocument();
    expect(logoImg).toHaveAttribute("src", "/logo.png");
  });

  it("renders brand name and tagline", () => {
    render(<Footer />);
    expect(screen.getByText("KINO")).toBeInTheDocument();
    expect(
      screen.getByText("— Personal Movies & Series Journal"),
    ).toBeInTheDocument();
  });

  it("renders the copyright text with the current year", () => {
    render(<Footer />);
    const currentYear = new Date().getFullYear().toString();
    expect(
      screen.getByText(new RegExp(`Alexis Rivadeneira © ${currentYear}`)),
    ).toBeInTheDocument();
  });
});
