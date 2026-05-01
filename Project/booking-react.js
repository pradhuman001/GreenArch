(function () {
  const h = React.createElement;
  const { useMemo, useState } = React;
  const whatsappNumber = "919876543210";

  const services = [
    {
      id: "plant-maintenance",
      name: "Plant Maintenance",
      description: "Weekly watering, trimming, and routine care for healthy plants."
    },
    {
      id: "garden-setup",
      name: "Garden Setup",
      description: "Fresh layout, planting guidance, and a clean garden start."
    },
    {
      id: "plant-health",
      name: "Plant Health",
      description: "Fast diagnosis and treatment support for stressed plants."
    }
  ];

  const steps = ["Service", "Details", "Photo", "Confirm"];

  function formatDate(value) {
    if (!value) {
      return "Not selected";
    }

    const date = new Date(`${value}T12:00:00`);
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric"
    }).format(date);
  }

  function buildWhatsAppUrl(summary) {
    const message = [
      "Hi GreenArch, I want to confirm a booking.",
      `Service: ${summary.serviceName}`,
      `Name: ${summary.name || "Not shared"}`,
      `Phone: ${summary.phone || "Not shared"}`,
      `Address: ${summary.address || "Not shared"}`,
      `Preferred date: ${summary.dateLabel}`,
      summary.photoName ? `Photo: ${summary.photoName}` : "Photo: Not uploaded"
    ].join("\n");

    return `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
  }

  function BookingStepper({ currentStep }) {
    const progress = ((currentStep - 1) / (steps.length - 1)) * 100;

    return h(
      "div",
      { className: "booking-stepper-wrap" },
      h(
        "div",
        { className: "booking-progress-bar", role: "progressbar", "aria-valuenow": progress, "aria-valuemin": 0, "aria-valuemax": 100 },
        h("span", { className: "booking-progress-fill", style: { width: `${progress}%` } })
      ),
      h(
        "div",
        { className: "booking-stepper" },
        steps.map((label, index) => {
          const step = index + 1;
          const stateClass = currentStep > step ? " is-complete" : currentStep === step ? " is-active" : "";
          return h(
            "div",
            { key: label, className: `booking-step-chip${stateClass}` },
            h("span", { className: "booking-step-chip-number" }, String(step)),
            h("span", { className: "booking-step-chip-label" }, label)
          );
        })
      )
    );
  }

  function ServiceCard({ service, selected, onSelect }) {
    return h(
      "button",
      {
        type: "button",
        className: `booking-service-card${selected ? " is-selected" : ""}`,
        onClick: () => onSelect(service.id),
        "aria-pressed": selected
      },
      h("span", { className: "booking-service-card-title" }, service.name),
      h("span", { className: "booking-service-card-copy" }, service.description)
    );
  }

  function SummaryRow({ label, value }) {
    return h(
      "div",
      { className: "booking-summary-row" },
      h("span", null, label),
      h("strong", null, value)
    );
  }

  function BookingApp() {
    const [step, setStep] = useState(1);
    const [serviceId, setServiceId] = useState("plant-maintenance");
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [preferredDate, setPreferredDate] = useState("");
    const [photoName, setPhotoName] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const selectedService = useMemo(() => services.find((service) => service.id === serviceId) || services[0], [serviceId]);

    const summary = {
      serviceName: selectedService.name,
      name: name.trim(),
      phone: phone.trim(),
      address: address.trim(),
      dateLabel: formatDate(preferredDate),
      photoName: photoName || "Not uploaded"
    };

    const canContinueFromDetails =
      name.trim().length > 1 && phone.replace(/\D/g, "").length >= 10 && address.trim().length > 3 && Boolean(preferredDate);

    function goBack() {
      setStep((currentStep) => Math.max(1, currentStep - 1));
    }

    function goNext() {
      if (step === 1) {
        setStep(2);
        return;
      }

      if (step === 2) {
        if (canContinueFromDetails) {
          setStep(3);
        }
        return;
      }

      if (step === 3) {
        setStep(4);
      }
    }

    function handleFileChange(event) {
      const file = event.target.files && event.target.files[0];
      setPhotoName(file ? file.name : "");
    }

    function handleSubmit(event) {
      event.preventDefault();

      if (step < 4) {
        goNext();
        return;
      }

      if (submitting || submitted) {
        return;
      }

      setSubmitting(true);
      window.setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
      }, 450);
    }

    const whatsappUrl = buildWhatsAppUrl(summary);

    if (submitted) {
      return h(
        "section",
        { className: "booking-success-shell" },
        h(
          "div",
          { className: "booking-success-card" },
          h("p", { className: "booking-eyebrow" }, "Booking confirmed"),
          h("h1", null, "Your booking is in"),
          h("p", { className: "booking-success-copy" }, "Booking received. Our team will contact you within 15-30 minutes."),
          h(
            "div",
            { className: "booking-success-summary" },
            h(SummaryRow, { label: "Service", value: summary.serviceName }),
            h(SummaryRow, { label: "Name", value: summary.name || "Not shared" }),
            h(SummaryRow, { label: "Phone", value: summary.phone || "Not shared" }),
            h(SummaryRow, { label: "Date", value: summary.dateLabel }),
            h(SummaryRow, { label: "Address", value: summary.address || "Not shared" }),
            h(SummaryRow, { label: "Photo", value: summary.photoName })
          ),
          h(
            "a",
            { className: "btn btn-solid booking-whatsapp-btn booking-success-whatsapp", href: whatsappUrl, target: "_blank", rel: "noreferrer" },
            "Chat on WhatsApp"
          )
        )
      );
    }

    return h(
      "section",
      { className: "booking-shell" },
      h(
        "div",
        { className: "booking-hero-block" },
        h("p", { className: "booking-eyebrow" }, "Premium booking flow"),
        h("h1", null, "Book gardening help fast"),
        h("p", { className: "booking-hero-copy" }, "A compact booking flow with clear steps and a clean green interface.")
      ),
      h(
        "div",
        { className: "booking-grid" },
        h(
          "div",
          { className: "booking-form-column" },
          h(
            "div",
            { className: "booking-card booking-form-card" },
            h(BookingStepper, { currentStep: step }),
            h(
              "form",
              { className: "booking-form", onSubmit: handleSubmit },
              h(
                "div",
                { className: "booking-step-panel" },
                step === 1 &&
                  h(
                    React.Fragment,
                    null,
                    h("div", { className: "booking-step-head" },
                      h("h2", null, "1. Choose a service"),
                      h("p", null, "Select the service that matches your garden need.")
                    ),
                    h(
                      "div",
                      { className: "booking-service-grid" },
                      services.map((service) =>
                        h(ServiceCard, {
                          key: service.id,
                          service,
                          selected: serviceId === service.id,
                          onSelect: setServiceId
                        })
                      )
                    )
                  ),
                step === 2 &&
                  h(
                    React.Fragment,
                    null,
                    h("div", { className: "booking-step-head" },
                      h("h2", null, "2. Add basic details"),
                      h("p", null, "Only the essentials so we can call you quickly.")
                    ),
                    h(
                      "div",
                      { className: "booking-fields" },
                      h(
                        "label",
                        { className: "booking-field" },
                        h("span", null, "Name"),
                        h("input", {
                          type: "text",
                          value: name,
                          onChange: (event) => setName(event.target.value),
                          placeholder: "Your full name",
                          autoComplete: "name",
                          required: true
                        })
                      ),
                      h(
                        "label",
                        { className: "booking-field" },
                        h("span", null, "Phone number"),
                        h("input", {
                          type: "tel",
                          value: phone,
                          onChange: (event) => setPhone(event.target.value),
                          placeholder: "10-digit phone number",
                          inputMode: "numeric",
                          required: true
                        })
                      ),
                      h(
                        "label",
                        { className: "booking-field booking-field-full" },
                        h("span", null, "Address"),
                        h("input", {
                          type: "text",
                          value: address,
                          onChange: (event) => setAddress(event.target.value),
                          placeholder: "House no, street, area",
                          required: true
                        })
                      ),
                      h(
                        "label",
                        { className: "booking-field booking-field-full" },
                        h("span", null, "Preferred date"),
                        h("input", {
                          type: "date",
                          value: preferredDate,
                          onChange: (event) => setPreferredDate(event.target.value),
                          required: true
                        })
                      )
                    )
                  ),
                step === 3 &&
                  h(
                    React.Fragment,
                    null,
                    h("div", { className: "booking-step-head" },
                      h("h2", null, "3. Upload a photo"),
                      h("p", null, "Optional, but helpful if you want faster guidance.")
                    ),
                    h(
                      "label",
                      { className: "booking-upload-card" },
                      h("span", { className: "booking-upload-label" }, "Upload photo (optional, helps us understand your garden better)"),
                      h("input", {
                        type: "file",
                        accept: "image/*",
                        onChange: handleFileChange
                      }),
                      h("small", null, photoName ? `Selected: ${photoName}` : "No photo selected")
                    )
                  ),
                step === 4 &&
                  h(
                    React.Fragment,
                    null,
                    h("div", { className: "booking-step-head" },
                      h("h2", null, "4. Confirm booking"),
                      h("p", null, "Review the details once, then confirm in one tap.")
                    ),
                    h(
                      "div",
                      { className: "booking-review-card" },
                      h(SummaryRow, { label: "Service", value: summary.serviceName }),
                      h(SummaryRow, { label: "Name", value: summary.name || "Not shared" }),
                      h(SummaryRow, { label: "Phone", value: summary.phone || "Not shared" }),
                      h(SummaryRow, { label: "Date", value: summary.dateLabel }),
                      h(SummaryRow, { label: "Address", value: summary.address || "Not shared" }),
                      h(SummaryRow, { label: "Photo", value: summary.photoName })
                    )
                  )
              ),
              h(
                "div",
                { className: "booking-actions" },
                h(
                  "button",
                  { type: "button", className: "booking-secondary-btn", onClick: goBack, disabled: step === 1 || submitting },
                  "Back"
                ),
                h(
                  "button",
                  {
                    type: "submit",
                    className: "btn btn-solid booking-primary-btn",
                    disabled: (step === 2 && !canAdvanceFromDetails) || submitting
                  },
                  step === 4 && submitting
                    ? h(React.Fragment, null, h("span", { className: "booking-spinner", "aria-hidden": "true" }), "Confirming...")
                    : step === 4
                      ? "Confirm Booking"
                      : "Continue"
                )
              )
            )
          )
        ),
        h(
          "aside",
          { className: "booking-summary-column" },
          h(
            "div",
            { className: "booking-card booking-summary-card" },
            h("p", { className: "booking-summary-kicker" }, "Booking summary"),
            h("h2", null, selectedService.name),
            h("p", { className: "booking-summary-subcopy" }, "A quick at-a-glance review of what will be booked."),
            h(
              "div",
              { className: "booking-summary-list" },
              h(SummaryRow, { label: "Service", value: summary.serviceName }),
              h(SummaryRow, { label: "Date", value: summary.dateLabel }),
              h(SummaryRow, { label: "Contact", value: summary.name || summary.phone ? `${summary.name || "Add your name"} • ${summary.phone || "Add your phone"}` : "Add name and phone" }),
              h(SummaryRow, { label: "Address", value: summary.address || "Add your address" }),
              h(SummaryRow, { label: "Photo", value: summary.photoName })
            ),
            h(
              "div",
              { className: "booking-summary-callout" },
              h("span", null, "Response time"),
              h("p", null, "We’ll contact you within 15-30 minutes after confirmation.")
            ),
            h(
              "a",
              { className: "booking-whatsapp-btn", href: whatsappUrl, target: "_blank", rel: "noreferrer" },
              "Chat on WhatsApp"
            )
          )
        )
      )
    );
  }

  const root = document.getElementById("booking-root");
  if (root && window.ReactDOM && typeof ReactDOM.createRoot === "function") {
    ReactDOM.createRoot(root).render(h(BookingApp));
  }
})();
