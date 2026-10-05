import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { ApplicationCard } from "../ApplicationCard";
import type { Application } from "../../types/application";

const application: Application = {
  id: 1,
  company: "Boxfusion",
  role: "Frontend Developer",
  website: "boxfusion.io",
  logoUrl: "",
  dateApplied: "2026-05-01",
  status: "Interview",
  notes: "Recruiter screen scheduled.",
  user_id: "user-123",
  created_at: "2026-06-16T00:00:00.000Z",
};

describe("ApplicationCard", () => {
  it("asks for confirmation before deleting an application", async () => {
    const user = userEvent.setup();
    const onDelete = vi.fn().mockResolvedValue(true);

    render(
      <ApplicationCard
        application={application}
        onDelete={onDelete}
        onEdit={vi.fn()}
        onOpenNotes={vi.fn()}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Delete Boxfusion" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(
      screen.getByRole("group", { name: "Confirm deleting Boxfusion" }),
    ).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(
      screen.queryByRole("group", { name: "Confirm deleting Boxfusion" }),
    ).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Delete Boxfusion" }));
    await user.click(screen.getByRole("button", { name: "Confirm Delete" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith(application.id);
  });
});
