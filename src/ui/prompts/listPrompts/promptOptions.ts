export const AddItemPrompt = (itemType: string) => ({
    name: `Add ${itemType}`,
    value: 'add'
})

export const EditItemPrompt = (itemType: string) => ({
    name: `Edit ${itemType}`,
    value: 'edit'
})

export const RemoveItemPrompt = (itemType: string) => ({
    name: `Remove ${itemType}`,
    value: 'remove'
})

export const ReorderItemPrompt = (itemType: string) => ({
    name: `Reorder ${itemType}`,
    value: 'reorder'
})

export const ContinuePrompt = {
    name: 'Continue',
    value: 'continue'
}

export const ExitPrompt = {
    name: 'Exit (Discard changes)',
    value: 'exit',
}
