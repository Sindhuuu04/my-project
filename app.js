const STORAGE_KEY = "mini-it-support-tickets";
const TICKET_STATUSES = ["Open", "In Progress", "Resolved"];
const TICKET_CATEGORIES = ["Hardware", "Software", "Network", "Access"];
const STORED_TICKET_CATEGORIES = [...TICKET_CATEGORIES, "Account Access", "Other"];
const TICKET_PRIORITIES = ["Low", "Medium", "High"];

const ticketForm = document.querySelector("#ticket-form");
const ticketList = document.querySelector("#ticket-list");
const emptyState = document.querySelector("#ticket-empty-state");
const searchInput = document.querySelector("#ticket-search");
const statusFilter = document.querySelector("#status-filter");
const categoryFilter = document.querySelector("#category-filter");
const clearFiltersButton = document.querySelector("#clear-filters");
const titleInput = document.querySelector("#ticket-title");
const requesterInput = document.querySelector("#ticket-requester");
const categoryInput = document.querySelector("#ticket-category");
const priorityInput = document.querySelector("#ticket-priority");
const descriptionInput = document.querySelector("#ticket-description");
const countElements = {
  total: document.querySelector("#total-ticket-count"),
  Open: document.querySelector("#open-ticket-count"),
  "In Progress": document.querySelector("#in-progress-ticket-count"),
  Resolved: document.querySelector("#resolved-ticket-count"),
};

const formMessage = document.createElement("p");
formMessage.id = "ticket-form-message";
formMessage.className = "form-field-full";
formMessage.setAttribute("role", "alert");
ticketForm.noValidate = true;
ticketForm.prepend(formMessage);

const appMessage = document.createElement("p");
appMessage.setAttribute("role", "status");
appMessage.setAttribute("aria-live", "polite");
appMessage.setAttribute("aria-atomic", "true");
document.querySelector("main").prepend(appMessage);

let tickets = [];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

function isValidTicket(ticket) {
  return (
    ticket !== null &&
    typeof ticket === "object" &&
    !Array.isArray(ticket) &&
    isNonEmptyString(ticket.id) &&
    isNonEmptyString(ticket.title) &&
    isNonEmptyString(ticket.requester) &&
    STORED_TICKET_CATEGORIES.includes(ticket.category) &&
    TICKET_PRIORITIES.includes(ticket.priority) &&
    isNonEmptyString(ticket.description) &&
    TICKET_STATUSES.includes(ticket.status) &&
    isNonEmptyString(ticket.createdAt) &&
    Number.isFinite(Date.parse(ticket.createdAt))
  );
}

function loadTickets() {
  let storedValue;

  try {
    storedValue = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return {
      tickets: [],
      warning: "Ticket storage is unavailable. Tickets will not persist after this page is closed.",
    };
  }

  if (storedValue === null) {
    return { tickets: [], warning: "" };
  }

  let parsedValue;
  try {
    parsedValue = JSON.parse(storedValue);
  } catch {
    return {
      tickets: [],
      warning: "Saved ticket data could not be read. Starting with an empty ticket list.",
    };
  }

  if (!Array.isArray(parsedValue)) {
    return {
      tickets: [],
      warning: "Saved ticket data was invalid. Starting with an empty ticket list.",
    };
  }

  const seenIds = new Set();
  const validTickets = parsedValue.filter((ticket) => {
    if (!isValidTicket(ticket) || seenIds.has(ticket.id)) {
      return false;
    }
    seenIds.add(ticket.id);
    return true;
  });

  return {
    tickets: validTickets.map((ticket) => ({
      ...ticket,
      category: ticket.category === "Account Access" ? "Access" : ticket.category,
    })),
    warning: validTickets.length === parsedValue.length
      ? ""
      : "Some saved ticket data was invalid and has been skipped.",
  };
}

function saveTickets() {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
    appMessage.textContent = "";
    return true;
  } catch {
    appMessage.textContent = "Could not save tickets to this browser. Changes are visible for now but may not persist after this page is closed.";
    return false;
  }
}

function createTicketId() {
  let id;
  do {
    id = typeof window.crypto?.randomUUID === "function"
      ? window.crypto.randomUUID()
      : `ticket-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  } while (tickets.some((ticket) => ticket.id === id));
  return id;
}

function createElement(tagName, className, text) {
  const element = document.createElement(tagName);
  if (className) {
    element.className = className;
  }
  if (text !== undefined) {
    element.textContent = text;
  }
  return element;
}

function formatCreationDate(createdAt) {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(createdAt));
}

function createTicketElement(ticket) {
  const listItem = createElement("li", "ticket-card");
  listItem.dataset.priority = ticket.priority;
  listItem.dataset.status = ticket.status;

  const heading = createElement("h3", "ticket-title", ticket.title);
  const details = createElement("dl", "ticket-details");
  const fields = [
    ["Requester", ticket.requester],
    ["Category", ticket.category],
    ["Priority", ticket.priority],
  ];

  for (const [label, value] of fields) {
    const term = createElement("dt", "", label);
    const description = createElement("dd", "", value);

    if (label === "Priority") {
      description.className = "ticket-priority";
      description.dataset.priority = ticket.priority;
    }

    details.append(term, description);
  }

  const statusLabel = createElement(
    "label",
    "form-field",
    `Status for ${ticket.title}`,
  );
  const statusSelect = document.createElement("select");
  statusSelect.className = "ticket-status";
  statusSelect.dataset.status = ticket.status;
  statusSelect.dataset.ticketId = ticket.id;
  statusSelect.setAttribute("aria-label", `Status for ${ticket.title}`);

  for (const status of TICKET_STATUSES) {
    const option = createElement("option", "", status);
    option.value = status;
    option.selected = status === ticket.status;
    statusSelect.append(option);
  }
  statusLabel.append(statusSelect);

  const statusDetails = createElement("p", "ticket-status-label");
  statusDetails.append(
    createElement("span", "ticket-status", ticket.status),
  );
  if (ticket.status !== "Resolved") {
    statusDetails.append(document.createTextNode(" Unresolved"));
  }

  const descriptionHeading = createElement("h4", "", "Description");
  const description = createElement("p", "ticket-description", ticket.description);
  const createdTime = document.createElement("time");
  createdTime.dateTime = ticket.createdAt;
  createdTime.textContent = `Created ${formatCreationDate(ticket.createdAt)}`;
  const createdDetails = createElement("p", "ticket-created");
  createdDetails.append(createdTime);

  const deleteButton = createElement("button", "ticket-delete", "Delete ticket");
  deleteButton.type = "button";
  deleteButton.dataset.ticketId = ticket.id;
  deleteButton.setAttribute("aria-label", `Delete ticket: ${ticket.title}`);

  listItem.append(
    heading,
    details,
    statusLabel,
    statusDetails,
    descriptionHeading,
    description,
    createdDetails,
    deleteButton,
  );
  return listItem;
}

function updateCounts() {
  countElements.total.textContent = String(tickets.length);
  for (const status of TICKET_STATUSES) {
    countElements[status].textContent = String(
      tickets.filter((ticket) => ticket.status === status).length,
    );
  }
}

function getVisibleTickets() {
  const query = searchInput.value.trim().toLocaleLowerCase();
  const selectedStatus = statusFilter.value;
  const selectedCategory = categoryFilter.value;

  return tickets.filter((ticket) => {
    const matchesSearch = !query ||
      ticket.title.toLocaleLowerCase().includes(query) ||
      ticket.requester.toLocaleLowerCase().includes(query);
    const matchesStatus = selectedStatus === "all" || ticket.status === selectedStatus;
    const matchesCategory = selectedCategory === "all" || ticket.category === selectedCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });
}

function renderTickets() {
  const visibleTickets = getVisibleTickets();
  const ticketElements = visibleTickets.map(createTicketElement);
  ticketList.replaceChildren(...ticketElements);

  if (tickets.length === 0) {
    emptyState.textContent = "There are no tickets yet. Use the form above to create the first support ticket.";
    emptyState.hidden = false;
  } else if (visibleTickets.length === 0) {
    emptyState.textContent = "No tickets match your search or filters. Try changing or clearing your filters.";
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
  }

  updateCounts();
}

function clearValidationErrors() {
  formMessage.textContent = "";
  for (const field of [titleInput, requesterInput, categoryInput, priorityInput, descriptionInput]) {
    field.removeAttribute("aria-invalid");
    field.removeAttribute("aria-describedby");
  }
}

function validateForm() {
  clearValidationErrors();

  const fields = [
    { name: "title", element: titleInput, label: "Ticket title", isValid: isNonEmptyString(titleInput.value) },
    { name: "requester", element: requesterInput, label: "Requester", isValid: isNonEmptyString(requesterInput.value) },
    { name: "category", element: categoryInput, label: "Category", isValid: TICKET_CATEGORIES.includes(categoryInput.value) },
    { name: "priority", element: priorityInput, label: "Priority", isValid: TICKET_PRIORITIES.includes(priorityInput.value) },
    { name: "description", element: descriptionInput, label: "Description", isValid: isNonEmptyString(descriptionInput.value) },
  ];
  const invalidFields = fields.filter((field) => !field.isValid);

  if (invalidFields.length > 0) {
    for (const field of invalidFields) {
      field.element.setAttribute("aria-invalid", "true");
      field.element.setAttribute("aria-describedby", formMessage.id);
    }
    formMessage.textContent = `Please provide a valid ${invalidFields.map((field) => field.label).join(", ")}.`;
    invalidFields[0].element.focus();
    return null;
  }

  return Object.fromEntries(fields.map(({ name, element }) => [
    name,
    element.value.trim(),
  ]));
}

function handleTicketSubmit(event) {
  event.preventDefault();
  const formValues = validateForm();
  if (!formValues) {
    return;
  }

  const ticket = {
    ...formValues,
    id: createTicketId(),
    status: "Open",
    createdAt: new Date().toISOString(),
  };
  tickets.unshift(ticket);
  saveTickets();
  ticketForm.reset();
  clearValidationErrors();
  searchInput.value = "";
  statusFilter.value = "all";
  categoryFilter.value = "all";
  renderTickets();
  if (!appMessage.textContent) {
    appMessage.textContent = "Ticket created successfully.";
  }
  titleInput.focus();
}

function handleTicketListChange(event) {
  const statusSelect = event.target.closest("select[data-ticket-id]");
  if (!statusSelect || !TICKET_STATUSES.includes(statusSelect.value)) {
    return;
  }

  const ticket = tickets.find((item) => item.id === statusSelect.dataset.ticketId);
  if (!ticket || ticket.status === statusSelect.value) {
    return;
  }

  ticket.status = statusSelect.value;
  saveTickets();
  renderTickets();
  if (!appMessage.textContent) {
    appMessage.textContent = "Ticket status updated.";
  }
}

function handleTicketListClick(event) {
  const deleteButton = event.target.closest("button[data-ticket-id]");
  if (!deleteButton) {
    return;
  }

  const ticket = tickets.find((item) => item.id === deleteButton.dataset.ticketId);
  if (!ticket || !window.confirm(`Delete the ticket "${ticket.title}"? This action cannot be undone.`)) {
    return;
  }

  tickets = tickets.filter((item) => item.id !== ticket.id);
  saveTickets();
  renderTickets();
  if (!appMessage.textContent) {
    appMessage.textContent = "Ticket deleted.";
  }
}

const loadedTickets = loadTickets();
tickets = loadedTickets.tickets;
if (loadedTickets.warning) {
  appMessage.textContent = loadedTickets.warning;
}

ticketForm.addEventListener("submit", handleTicketSubmit);
ticketList.addEventListener("change", handleTicketListChange);
ticketList.addEventListener("click", handleTicketListClick);
searchInput.addEventListener("input", renderTickets);
statusFilter.addEventListener("change", renderTickets);
categoryFilter.addEventListener("change", renderTickets);
clearFiltersButton.addEventListener("click", () => {
  searchInput.value = "";
  statusFilter.value = "all";
  categoryFilter.value = "all";
  renderTickets();
});
renderTickets();