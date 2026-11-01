import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApplicationForm } from "../ApplicationForm";
import type { ApplicationFormValues } from "../../types/application";

const validApplication: ApplicationFormValues = {
  company: "Boxfusion",
  role: "Frontend Developer",
  website: "boxfusion.io",
  logoUrl: "",
  dateApplied: "2026-05-01",
  status: "Interview",
  notes: "Recruiter screen scheduled.",
};

describe("ApplicationForm", () => {
  it("blocks invalid submissions and lets the user correct the errors", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(<ApplicationForm onSubmit={onSubmit} />);

    await user.click(screen.getByRole("button", { name: "Add Application" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(screen.getByText("Company name is required.")).toBeInTheDocument();
    expect(screen.getByText("Role is required.")).toBeInTheDocument();
    expect(
      screen.getByText("Application date is required."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText(/^Company$/), "Boxfusion");
    await user.type(screen.getByLabelText("Role"), "Frontend Developer");
    fireEvent.change(screen.getByLabelText("Date Applied"), {
      target: { value: "2026-05-01" },
    });
    await user.click(screen.getByRole("button", { name: "Add Application" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(
      screen.queryByText("Company name is required."),
    ).not.toBeInTheDocument();
    expect(screen.queryByText("Role is required.")).not.toBeInTheDocument();
    expect(
      screen.queryByText("Application date is required."),
    ).not.toBeInTheDocument();
  });

  it("blocks an invalid website while preserving the rest of the form", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ApplicationForm
        initialValues={{ ...validApplication, website: "invalid" }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Application" }));

    expect(onSubmit).not.toHaveBeenCalled();
    expect(
      screen.getByText("Please enter a valid website domain."),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^Company$/)).toHaveValue("Boxfusion");
  });

  it("submits trimmed text and a normalized website domain", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(
      <ApplicationForm
        initialValues={{
          ...validApplication,
          company: "  Boxfusion  ",
          role: "  Frontend Developer  ",
          notes: "  Recruiter screen scheduled.  ",
          website: " https://www.boxfusion.io/careers?source=jobs ",
        }}
        onSubmit={onSubmit}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Application" }));

    expect(onSubmit).toHaveBeenCalledExactlyOnceWith(validApplication);
  });

  it("prevents submission while a save is in progress", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(
      <ApplicationForm
        initialValues={validApplication}
        onSubmit={onSubmit}
        isLoading
      />,
    );

    const button = screen.getByRole("button", { name: "Saving..." });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("keeps entered values when submit fails", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(false);

    render(
      <ApplicationForm
        initialValues={validApplication}
        onSubmit={onSubmit}
        submitError="Failed to update application."
      />,
    );

    await user.click(screen.getByRole("button", { name: "Add Application" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/^Company$/)).toHaveValue("Boxfusion");
    expect(screen.getByLabelText("Role")).toHaveValue("Frontend Developer");
    expect(screen.getByLabelText("Notes")).toHaveValue(
      "Recruiter screen scheduled.",
    );
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Failed to update application.",
    );
  });

  it("resets entered values after submit succeeds", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue(true);

    render(
      <ApplicationForm initialValues={validApplication} onSubmit={onSubmit} />,
    );

    await user.click(screen.getByRole("button", { name: "Add Application" }));

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/^Company$/)).toHaveValue("");
    expect(screen.getByLabelText("Role")).toHaveValue("");
    expect(screen.getByLabelText("Notes")).toHaveValue("");
  });
});
