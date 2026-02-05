import { MemoryRouter } from "react-router-dom";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { ShoppingPage } from "@/pages/ShoppingPage";
import { useAppStore } from "@/stores/useAppStore";
import { SAMPLE_MENU_BOOK } from "@/data/sampleMenuBook";

const cloneSample = () => structuredClone(SAMPLE_MENU_BOOK);
const initialState = useAppStore.getInitialState();

describe("ShoppingPage interactions", () => {
  beforeEach(() => {
    localStorage.clear();
    useAppStore.persist.clearStorage?.();
    useAppStore.setState(initialState, true);
    const book = cloneSample();
    useAppStore.setState({ menuBooks: [book], currentWeekId: book.id });
  });

  it("allows editing and deleting an item via the modal flow", async () => {
    render(
      <MemoryRouter>
        <ShoppingPage />
      </MemoryRouter>,
    );

    expect(await screen.findByText("Sourdough bread")).toBeInTheDocument();

    const targetName = "Sourdough bread";
    const editButton = screen.getByRole("button", { name: `Edit ${targetName}` });
    fireEvent.click(editButton);

    expect(await screen.findByRole("button", { name: /save item/i })).toBeInTheDocument();

    const deleteButton = await screen.findByRole("button", { name: /delete item/i });
    fireEvent.click(deleteButton);

    await waitFor(() => expect(screen.getByText(/remove item/i)).toBeInTheDocument());

    const confirmDelete = screen.getByRole("button", { name: /^delete$/i });
    fireEvent.click(confirmDelete);

    await waitFor(() => expect(screen.queryByText(targetName)).not.toBeInTheDocument());
  });
});
