(function () {
  "use strict";

  var header = document.querySelector(".site-header");
  var navToggle = document.querySelector(".nav-toggle");
  var navMenu = document.querySelector(".nav-menu");
  var yearTargets = document.querySelectorAll("[data-current-year]");
  var enrollmentForm = document.getElementById("enrollment-form");
  var whatsAppNumber = "923162997108";

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
      "Hello Enlighten Educational Institute,",
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
      var whatsAppUrl = "https://wa.me/" + whatsAppNumber + "?text=" + encodedMessage;
      window.open(whatsAppUrl, "_blank", "noopener");
    });
  }
})();
