(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  var yearTargets = document.querySelectorAll("[data-current-year]");
  var enrollmentForm = document.getElementById("enrollment-form");
  var whatsAppNumber = "923162997108";
  var whatsAppUrl = "https://wa.me/" + whatsAppNumber;

  function updateHeaderShadow() {
    if (!header) {
      return;
    }
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  }

  function closeMenu() {
    if (!navToggle || !navMenu) {
      return;
    }
    navToggle.classList.remove("is-open");
    navMenu.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Open menu");
  }

  if (navToggle && navMenu) {
    navToggle.addEventListener("click", function () {
      var isOpen = navMenu.classList.toggle("is-open");
      navToggle.classList.toggle("is-open", isOpen);
      navToggle.setAttribute("aria-expanded", String(isOpen));
      navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
    });

    navMenu.addEventListener("click", function (event) {
      if (event.target.closest("a")) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
      }
    });
  }

  window.addEventListener("scroll", updateHeaderShadow, { passive: true });
  updateHeaderShadow();

  yearTargets.forEach(function (target) {
    target.textContent = String(new Date().getFullYear());
  });

  var revealItems = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });

    revealItems.forEach(function (item) {
      observer.observe(item);
    });
  } else {
    revealItems.forEach(function (item) {
      item.classList.add("is-visible");
    });
  }

  function getField(form, name) {
    return form.elements[name];
  }

  function getValue(form, name) {
    var field = getField(form, name);
    return field ? field.value.trim() : "";
  }

  function setError(field, message) {
    var wrapper = field.closest(".form-field");
    var error = wrapper ? wrapper.querySelector(".error-message") : null;

    if (wrapper) {
      wrapper.classList.toggle("has-error", Boolean(message));
    }

    if (error) {
      error.textContent = message;
    }
  }

  function validateEnrollmentForm(form) {
    var requiredFields = ["studentName", "parentName", "phone", "campus", "program", "studentClass"];
    var firstInvalid = null;

    requiredFields.forEach(function (name) {
      var field = getField(form, name);
      if (!field) {
        return;
      }

      if (!field.value.trim()) {
        setError(field, "This field is required.");
        firstInvalid = firstInvalid || field;
      } else {
        setError(field, "");
      }
    });

    var email = getField(form, "email");
    if (email && email.value.trim() && !email.validity.valid) {
      setError(email, "Please enter a valid email address.");
      firstInvalid = firstInvalid || email;
    } else if (email) {
      setError(email, "");
    }

    if (firstInvalid) {
      firstInvalid.focus();
      return false;
    }

    return true;
  }

  function lineValue(label, value) {
    return label + ": " + (value || "Not provided");
  }

  function buildWhatsAppMessage(form) {
    var message = [
      "Hello Enlighten Institute,",
      "",
      "I would like to inquire about enrollment.",
      "",
      lineValue("Student Name", getValue(form, "studentName")),
      lineValue("Parent / Guardian", getValue(form, "parentName")),
      lineValue("Phone Number", getValue(form, "phone")),
      lineValue("Email Address", getValue(form, "email")),
      "",
      lineValue("Selected Campus", getValue(form, "campus")),
      lineValue("Selected Program", getValue(form, "program")),
      lineValue("Student Class / Grade", getValue(form, "studentClass")),
      lineValue("Preferred Timing", getValue(form, "timing")),
      "",
      "Additional Message:",
      getValue(form, "message") || "Not provided",
      "",
      "Thank you."
    ];

    return message.join("\n");
  }

  function autoSelectProgram() {
    if (!enrollmentForm) {
      return;
    }

    var programSelect = getField(enrollmentForm, "program");
    var params = new URLSearchParams(window.location.search);
    var service = params.get("service");

    if (!programSelect || !service) {
      return;
    }

    var serviceMap = {
      "O Level": "O Level",
      "A Level": "A Level",
      "IX X XI XII": "IX, X, XI & XII",
      "Edexcel": "Edexcel",
      "Morning Program": "Morning Program",
      "Juniors": "Juniors \u2014 Class 5 to 8"
    };

    var selectedValue = serviceMap[service] || service;
    var matchingOption = Array.prototype.find.call(programSelect.options, function (option) {
      return option.value === selectedValue || option.textContent.trim() === selectedValue;
    });

    if (matchingOption) {
      programSelect.value = matchingOption.value;
    }
  }

  if (enrollmentForm) {
    autoSelectProgram();

    enrollmentForm.addEventListener("input", function (event) {
      var field = event.target;
      if (field.matches("input, select, textarea") && field.closest(".has-error")) {
        setError(field, "");
      }
    });

    enrollmentForm.addEventListener("submit", function (event) {
      event.preventDefault();

      var status = document.getElementById("form-status");
      if (status) {
        status.textContent = "";
      }

      if (!validateEnrollmentForm(enrollmentForm)) {
        if (status) {
          status.textContent = "Please complete the required fields before continuing.";
        }
        return;
      }

      var encodedMessage = encodeURIComponent(buildWhatsAppMessage(enrollmentForm));
      window.open(whatsAppUrl + "?text=" + encodedMessage, "_blank", "noopener");
    });
  }

  function createChatbot() {
    var launcher = document.createElement("button");
    var panel = document.createElement("section");
    var messages = document.createElement("div");
    var quickActions = document.createElement("div");
    var form = document.createElement("form");
    var input = document.createElement("input");
    var hasOpened = false;

    launcher.className = "chatbot-launcher";
    launcher.type = "button";
    launcher.setAttribute("aria-label", "Open Enlighten Assistant");
    launcher.setAttribute("aria-expanded", "false");
    launcher.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z"/><path d="M8 9h8M8 13h5"/></svg>';

    panel.className = "chatbot-panel";
    panel.setAttribute("aria-label", "Enlighten Assistant chat");
    panel.innerHTML = [
      '<div class="chatbot-header">',
      '<div><strong>Enlighten Assistant</strong><span>Ask us about programs, campuses &amp; enrollment</span></div>',
      '<button class="chatbot-close" type="button" aria-label="Close Enlighten Assistant"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M18 6 6 18M6 6l12 12"/></svg></button>',
      '</div>'
    ].join("");

    messages.className = "chatbot-messages";
    quickActions.className = "chatbot-quick-actions";
    form.className = "chatbot-composer";
    input.className = "chatbot-input";
    input.type = "text";
    input.placeholder = "Type your question...";
    input.setAttribute("aria-label", "Type your question");
    form.appendChild(input);
    form.insertAdjacentHTML("beforeend", '<button class="chatbot-send" type="submit" aria-label="Send message"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="m22 2-7 20-4-9-9-4 20-7Z"/><path d="M22 2 11 13"/></svg></button>');
    panel.appendChild(messages);
    panel.appendChild(quickActions);
    panel.appendChild(form);

    function scrollMessages() {
      messages.scrollTop = messages.scrollHeight;
    }

    function addActions(container, actions) {
      if (!actions || !actions.length) {
        return;
      }

      var actionWrap = document.createElement("div");
      actionWrap.className = "chat-actions";

      actions.forEach(function (action) {
        var button = document.createElement(action.url ? "a" : "button");
        button.className = "chatbot-action";
        button.textContent = action.label;

        if (action.url) {
          button.href = action.url;
          if (action.external) {
            button.target = "_blank";
            button.rel = "noopener";
          }
        } else {
          button.type = "button";
          button.addEventListener("click", function () {
            sendUserMessage(action.message || action.label);
          });
        }

        actionWrap.appendChild(button);
      });

      container.appendChild(actionWrap);
    }

    function addMessage(text, sender, actions) {
      var bubble = document.createElement("div");
      var body = document.createElement("p");
      bubble.className = "chat-message " + sender;
      body.textContent = text;
      bubble.appendChild(body);
      addActions(bubble, actions);
      messages.appendChild(bubble);
      scrollMessages();
    }

    function getBotResponse(message) {
      var text = message.toLowerCase();
      var feeWords = /(fee|fees|charge|charges|monthly|admission fee|tuition)/;
      var programWords = /(program|programs|course|courses|offer|study|subjects)/;
      var campusWords = /(campus|campuses|location|locations|address|where|precinct|bahria)/;
      var enrollWords = /(enroll|enrol|admission|admissions|register|apply|join)/;
      var contactWords = /(contact|phone|number|whatsapp|call|mobile)/;

      if (feeWords.test(text)) {
        return {
          text: "Fee details may vary depending on the selected program. Please contact Enlighten Institute on WhatsApp for current fee information.",
          actions: [{ label: "Ask on WhatsApp", url: whatsAppUrl, external: true }]
        };
      }

      if (/\bo\s*level\b/.test(text)) {
        return {
          text: "Our O Level program supports students with concept clarity, exam-focused preparation and regular academic guidance. You can continue through enrollment or WhatsApp.",
          actions: [
            { label: "Enroll Now", url: "enroll.html?service=O%20Level" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (/\ba\s*level\b/.test(text)) {
        return {
          text: "Our A Level program provides advanced academic support, structured preparation and guidance for stronger subject understanding.",
          actions: [
            { label: "Enroll Now", url: "enroll.html?service=A%20Level" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (/(junior|juniors|class 5|class 6|class 7|class 8|5 to 8|5-8)/.test(text)) {
        return {
          text: "The Juniors program is for Class 5 to 8 and focuses on building stronger academic foundations, better concepts and confidence.",
          actions: [
            { label: "Enroll Now", url: "enroll.html?service=Juniors" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (/morning/.test(text)) {
        return {
          text: "The Morning Program offers a focused morning learning routine with academic guidance and a supportive study environment.",
          actions: [
            { label: "Enroll Now", url: "enroll.html?service=Morning%20Program" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (/edexcel/.test(text)) {
        return {
          text: "The Edexcel program supports students following the Edexcel curriculum with curriculum-focused learning, guided practice and exam preparation.",
          actions: [
            { label: "Enroll Now", url: "enroll.html?service=Edexcel" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (/(ix|xi|xii|class 9|class 10|class 11|class 12|9th|10th|11th|12th|board|matric|intermediate)/.test(text)) {
        return {
          text: "We support students in IX, X, XI and XII with school and college academics, board preparation, revision and regular practice.",
          actions: [
            { label: "Enroll Now", url: "enroll.html?service=IX%20X%20XI%20XII" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (programWords.test(text)) {
        return {
          text: "Enlighten Institute currently offers O Level, A Level, IX-XII, Edexcel, Morning Program and Juniors for Class 5 to 8.",
          actions: [
            { label: "View Programs", url: "services.html" },
            { label: "Enroll Now", url: "enroll.html" }
          ]
        };
      }

      if (campusWords.test(text)) {
        return {
          text: "We currently have campuses at:\n\n- Precinct-2, Bahria Town Karachi\n- Precinct-10A, Bahria Town Karachi",
          actions: [{ label: "Contact Us", url: whatsAppUrl, external: true }]
        };
      }

      if (enrollWords.test(text)) {
        return {
          text: "Students and parents can enroll through the Enroll Now page or contact Enlighten Institute directly on WhatsApp.",
          actions: [
            { label: "Enroll Now", url: "enroll.html" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (contactWords.test(text)) {
        return {
          text: "You can contact Enlighten Institute at +92 316 2997108.",
          actions: [
            { label: "Call Now", url: "tel:+923162997108" },
            { label: "WhatsApp Us", url: whatsAppUrl, external: true }
          ]
        };
      }

      if (/(hello|hi|hey|salam|assalam)/.test(text)) {
        return {
          text: "Hello! You can ask me about programs, campuses, enrollment, fees or contact details.",
          actions: [
            { label: "View Programs", message: "What programs do you offer?" },
            { label: "Enroll Now", message: "How can I enroll?" }
          ]
        };
      }

      return {
        text: "I don't have confirmed information about that yet. Please contact our team on WhatsApp for assistance.",
        actions: [{ label: "WhatsApp Us", url: whatsAppUrl, external: true }]
      };
    }

    function showResponse(message) {
      var response = getBotResponse(message);
      window.setTimeout(function () {
        addMessage(response.text, "bot", response.actions);
      }, 180);
    }

    function sendUserMessage(message) {
      var cleanMessage = message.trim();
      if (!cleanMessage) {
        return;
      }

      addMessage(cleanMessage, "user");
      showResponse(cleanMessage);
    }

    function populateQuickActions() {
      var actions = [
        { label: "Our Programs", message: "What programs do you offer?" },
        { label: "O Level", message: "Tell me about O Level" },
        { label: "A Level", message: "Tell me about A Level" },
        { label: "Morning Program", message: "Tell me about Morning Program" },
        { label: "Juniors", message: "Tell me about Juniors" },
        { label: "Campuses", message: "Where are your campuses?" },
        { label: "Fees", message: "What is the fee?" },
        { label: "Enrollment", message: "How can I enroll?" },
        { label: "Contact Us", message: "How can I contact you?" }
      ];

      actions.forEach(function (action) {
        var button = document.createElement("button");
        button.className = "chatbot-action";
        button.type = "button";
        button.textContent = action.label;
        button.addEventListener("click", function () {
          sendUserMessage(action.message);
        });
        quickActions.appendChild(button);
      });
    }

    function openChatbot() {
      panel.classList.add("is-open");
      launcher.classList.add("is-hidden");
      launcher.setAttribute("aria-expanded", "true");

      if (!hasOpened) {
        addMessage("Hello! \uD83D\uDC4B Welcome to Enlighten Institute. How can I help you today?", "bot");
        hasOpened = true;
      }

      window.setTimeout(function () {
        input.focus();
      }, 50);
    }

    function closeChatbot() {
      panel.classList.remove("is-open");
      launcher.classList.remove("is-hidden");
      launcher.setAttribute("aria-expanded", "false");
      launcher.focus();
    }

    launcher.addEventListener("click", openChatbot);
    panel.querySelector(".chatbot-close").addEventListener("click", closeChatbot);
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      sendUserMessage(input.value);
      input.value = "";
    });

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault();
        sendUserMessage(input.value);
        input.value = "";
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape" && panel.classList.contains("is-open")) {
        closeChatbot();
      }
    });

    populateQuickActions();
    document.body.appendChild(launcher);
    document.body.appendChild(panel);
  }

  createChatbot();
})();
