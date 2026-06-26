import { render, screen } from "@testing-library/react";
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

    await user.click(
      screen.getByRole("button", { name: "Add Application" }),
    );

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
      <ApplicationForm
        initialValues={validApplication}
        onSubmit={onSubmit}
      />,
    );

    await user.click(
      screen.getByRole("button", { name: "Add Application" }),
    );

    expect(onSubmit).toHaveBeenCalledTimes(1);
    expect(screen.getByLabelText(/^Company$/)).toHaveValue("");
    expect(screen.getByLabelText("Role")).toHaveValue("");
    expect(screen.getByLabelText("Notes")).toHaveValue("");
  });
});
