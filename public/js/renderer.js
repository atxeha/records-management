// const user = JSON.parse(localStorage.getItem("activeUser"));

document.addEventListener("DOMContentLoaded", async () => {

  const loginMessage = localStorage.getItem("loginMessage");

  if (loginMessage) {

    window.electronAPI.showToast(loginMessage, true);

    localStorage.removeItem("loginMessage");
  }

  const scheduleBtn = document.getElementById("scheduleBtn");
  const viewScheduleBtn = document.getElementById("viewScheduleBtn");
  const homeBtn = document.getElementById("homeBtn");
  const prBtn = document.getElementById("PRBtn");
  const pettyCashBtn = document.getElementById("pettyCashBtn");
  const RISBtn = document.getElementById("RISBtn");
  const voucherBtn = document.getElementById("voucherBtn");
  const franchiseBtn = document.getElementById("franchiseBtn");
  const ORBtn = document.getElementById("ORBtn");
  const settingsBtn = document.getElementById("settingsBtn");

  function attachScrollListener() {
    const tableContainer = document.querySelector(".table-container");
    const tableHead = document.querySelector(".table thead");

    if (tableContainer && tableHead) {
      tableContainer.addEventListener("scroll", function () {
        tableContainer.classList.add("scrolling");

        clearTimeout(tableContainer.scrollTimeout);
        tableContainer.scrollTimeout = setTimeout(() => {
          tableContainer.classList.remove("scrolling");
        }, 400);

        if (tableContainer.scrollTop > 0) {
          tableHead.style.boxShadow = "0 8px 12px rgba(0, 0, 0, 0.1)";
        } else {
          tableHead.style.boxShadow = "none";
        }
      });
    }
  }

  function initializeTooltips() {
    // Remove all existing tooltip DOM elements
    document.querySelectorAll('.tooltip').forEach(t => t.remove());

    var tooltipTriggerList = [].slice.call(
      document.querySelectorAll('[data-bs-toggle="tooltip"]')
    );

    // Dispose existing tooltips to avoid duplicates
    tooltipTriggerList.forEach((el) => {
      const tooltipInstance = bootstrap.Tooltip.getInstance(el);
      if (tooltipInstance) {
        tooltipInstance.dispose();
      }
    });

    tooltipTriggerList.map(
      (tooltipTriggerEl) => new bootstrap.Tooltip(tooltipTriggerEl)
    );
  }


    async function loadPage(page) {
        await fetch(`./${page}`)
            .then((response) => response.text())
            .then(async (data) => {
                document.getElementById("main-content").innerHTML = data;
                initializeTooltips();
                attachDynamicEventListeners();
                localStorage.setItem("currentPage", page);

                // Attach scroll listener after content load
                attachScrollListener();

                if (page === "home.html") {
                  const fetchTodaysSchedules = await import("./logics/populateSchedules.js")
                  const homeModule = await import("./logics/home.js")

                  fetchTodaysSchedules.sampleUsage();
                  homeModule.initCount();
                  homeModule.initFetchFranchise()
                }

                if (page === "settings.html") {
                  const module = await import("./logics/settings.js")

                  module.updateAccountInfo();
                  module.logout()
                  module.showPassword("toggleIcon", "settingsPass")
                  module.showPassword("toggleIcons", "staffPass")
                  module.populateFields()
                  module.addStaff()
                }

                if (page === "schedule.html") {
                    // Dynamically import addSchedule.js to attach event listeners
                    const addScheduleModule = await import("./logics/addSchedule.js");
                    addScheduleModule.initAddSchedule();

                    const fetchSchedulesModule = await import(
                        "./logics/fetchSchedules.js"
                    );

                    // Retain filter value from localStorage or default to 'all'
                    const filterSelect = document.getElementById("filterSchedule");
                    let currentFilter = "all";
                    if (filterSelect) {
                        const savedFilter = localStorage.getItem("scheduleFilter");
                        if (savedFilter) {
                            currentFilter = savedFilter;
                            filterSelect.value = savedFilter;
                        } else {
                            filterSelect.value = currentFilter;
                        }
                    }

                    const statusSelect = document.getElementById("filterScheduleStatus");
                    let currentStatus = "all";
                    if (statusSelect) {
                        const savedStatus = localStorage.getItem("scheduleStatusFilter");
                        if (savedStatus) {
                            currentStatus = savedStatus;
                            statusSelect.value = savedStatus;
                        } else {
                            statusSelect.value = currentStatus;
                        }
                    }

                    fetchSchedulesModule.fetchAndRenderSchedules(currentFilter, currentStatus);
                    fetchSchedulesModule.initDeleteAllSchedule();
                    fetchSchedulesModule.initFilterSchedule();
                    fetchSchedulesModule.initFilterScheduleStatus();
                    fetchSchedulesModule.initCancelSchedule();
                    fetchSchedulesModule.initreschedule();
                    fetchSchedulesModule.initDoneSchedule();
                    fetchSchedulesModule.initDeleteSchedule();

                    // Save filter changes to localStorage
                    if (filterSelect) {
                        filterSelect.addEventListener("change", () => {
                            localStorage.setItem("scheduleFilter", filterSelect.value);
                        });
                    }

                    if (statusSelect) {
                        statusSelect.addEventListener("change", () => {
                            localStorage.setItem("scheduleStatusFilter", statusSelect.value);
                        });
                    }
                }

                if (page === "purchaseRequest.html") {
                    const prModule = await import("./logics/purchaseRequest.js")
                     let modalId = "";

                    const purchaseFilter = document.getElementById("purchaseFilter");
                    let currentPurchaseFilter = "";
                    if (purchaseFilter) {
                        const savedFilter = localStorage.getItem("purchaseFilter");
                        if (savedFilter) {
                            currentPurchaseFilter = savedFilter;
                            purchaseFilter.value = savedFilter;
                        } else {
                            purchaseFilter.value = currentPurchaseFilter;
                        }
                    }

                    prModule.initNewPurchaseRequest();
                    prModule.initFetchPurchaseRequest(currentPurchaseFilter);
                    prModule.initRejectApprovePr(currentPurchaseFilter);
                    prModule.initDeleteAllPr(currentPurchaseFilter);

                    document.addEventListener(
                      "shown.bs.modal",
                      function (event) {
                        modalId = event.target.id;
                        if (modalId === "rejectAllPurchaseModal") {
                          prModule.initUpdateAllPurchaseStatus(
                            "rejectAllPurchaseModal",
                            "purchaseRequest",
                            "rejected",
                            currentPurchaseFilter
                          );
                        } else if (modalId === "approveAllPurchaseModal") {
                          prModule.initUpdateAllPurchaseStatus(
                            "approveAllPurchaseModal",
                            "purchaseRequest",
                            "approved",
                            currentPurchaseFilter
                          );
                        }
                      }
                    );

                    if (purchaseFilter) {
                        purchaseFilter.addEventListener("input", () => {
                            localStorage.setItem("purchaseFilter", purchaseFilter.value);
                            prModule.initFetchPurchaseRequest(purchaseFilter.value);
                        });
                    }
                }

                if (page === "pettyCash.html") {
                    const pcModule = await import("./logics/pettyCash.js")

                    const filter = document.getElementById("pettyCashFilter");
                    let currentFilter = "";
                    if (filter) {
                        const savedFilter = localStorage.getItem("pettyCashFilter");
                        if (savedFilter) {
                            currentFilter = savedFilter;
                            filter.value = savedFilter;
                        } else {
                            filter.value = currentFilter;
                        }
                    }

                    pcModule.initNewPettyCash();
                    pcModule.initFetchPettyCash(currentFilter);
                    pcModule.initReleasePc(currentFilter);
                    pcModule.initDeletePc(currentFilter);
                    pcModule.initReleaseAllPc(currentFilter);
                    pcModule.initDeleteAllPc();

                    if (filter) {
                        filter.addEventListener("input", () => {
                            localStorage.setItem("pettyCashFilter", filter.value);
                            pcModule.initFetchPettyCash(filter.value);
                        });
                    }
                }

                if (page === "requisition.html") {
                  const risModule = await import("./logics/requisition.js")

                  let modalId = "";
                  
                  const filter = document.getElementById("risFilter");
                  let currentRisFilter = "";
                  if (filter) {
                    const savedFilter = localStorage.getItem("risFilter");
                    if (savedFilter) {
                      currentRisFilter = savedFilter;
                      filter.value = savedFilter;
                    } else {
                      filter.value = currentRisFilter;
                    }
                  }

                  risModule.initNewRis();
                  risModule.initFetchRis(currentRisFilter);
                  risModule.initApproveRejectRis(currentRisFilter);
                  risModule.initDeleteAllRis();

                  document.addEventListener("shown.bs.modal", function (event) {
                    modalId = event.target.id;
                    if (modalId === "rejectAllRisModal") {
                      risModule.initUpdateAllRisStatus(
                        "rejectAllRisModal",
                        "requisitionIssueSlip",
                        "rejected",
                        currentRisFilter
                      );
                    } else if (modalId === "approveAllRisModal") {
                      risModule.initUpdateAllRisStatus(
                        "approveAllRisModal",
                        "requisitionIssueSlip",
                        "approved",
                        currentRisFilter
                      );
                    }
                  });

                  if (filter) {
                    filter.addEventListener("input", () => {
                      localStorage.setItem("risFilter", filter.value);
                      risModule.initFetchRis(filter.value);
                    });
                  }
                }

                if (page === "voucher.html") {
                  const voucherModule = await import("./logics/voucher.js");

                  let modalId = "";

                  const filter = document.getElementById("voucherFilter");
                  let voucherFilter = "";
                  if (filter) {
                    const savedFilter = localStorage.getItem("voucherFilter");
                    if (savedFilter) {
                      voucherFilter = savedFilter;
                      filter.value = savedFilter;
                    } else {
                      filter.value = voucherFilter;
                    }
                  }

                  voucherModule.initNewVoucher();
                  voucherModule.initFetchVoucher(voucherFilter);
                  voucherModule.initApproveRejectVoucher(voucherFilter);
                  voucherModule.initDeleteAllVoucher();

                  document.addEventListener("shown.bs.modal", function (event) {
                    modalId = event.target.id;
                    if (modalId === "rejectAllVoucherModal") {
                      voucherModule.initUpdateAllVoucherStatus(
                        "rejectAllVoucherModal",
                        "voucher",
                        "rejected",
                        voucherFilter
                      );
                    } else if (modalId === "approveAllVoucherModal") {
                      voucherModule.initUpdateAllVoucherStatus(
                        "approveAllVoucherModal",
                        "voucher",
                        "approved",
                        voucherFilter
                      );
                    }
                  });

                  if (filter) {
                    filter.addEventListener("input", () => {
                      localStorage.setItem("voucherFilter", filter.value);
                      voucherModule.initFetchVoucher(filter.value);
                    });
                  }
                }
                if (page === "franchise.html") {
                  const franchiseModule = await import("./logics/franchise.js");
                  
                  const filter = document.getElementById("franchiseFilter");
                  let franchiseFilter = "";
                  if (filter) {
                    const savedFilter = localStorage.getItem("franchiseFilter");
                    if (savedFilter) {
                      franchiseFilter = savedFilter;
                      filter.value = savedFilter;
                    } else {
                      filter.value = franchiseFilter;
                    }
                  }

                  franchiseModule.initNewFranchise();
                  franchiseModule.initFetchFranchise(franchiseFilter);
                  franchiseModule.initDeleteAllFranchise();
                  franchiseModule.initDeleteFranchise(franchiseFilter);
                  franchiseModule.initPopulateFranchise();
                  franchiseModule.initRejectApprove();

                  document.addEventListener("shown.bs.modal", function (event) {
                    modalId = event.target.id;

                    console.log(modalId)
                    if (modalId === "releaseAllFranchiseModal") {
                      franchiseModule.initUpdateAllFranchiseStatus(
                        "releaseAllFranchiseModal",
                        "franchise",
                        "released",
                        franchiseFilter
                      );
                    }
                  });

                  if (filter) {
                    filter.addEventListener("input", () => {
                      localStorage.setItem("franchiseFilter", filter.value);
                      franchiseModule.initFetchFranchise(filter.value);
                    });
                  }
                }
                if (page === "obligation.html") {
                  const orModule = await import("./logics/obligation.js");

                  let modalId = "";
                  
                  const filter = document.getElementById("obligationFilter");
                  let obligationFilter = "";
                  if (filter) {
                    const savedFilter = localStorage.getItem("obligationFilter");
                    if (savedFilter) {
                      obligationFilter = savedFilter;
                      filter.value = savedFilter;
                    } else {
                      filter.value = obligationFilter;
                    }
                  }

                  orModule.initNewOr();
                  orModule.initRejectApproveOr(obligationFilter)
                  orModule.initFetchOr(obligationFilter);
                  orModule.initDeleteAllOr();

                  document.addEventListener(
                    "shown.bs.modal",
                    function (event) {
                      modalId = event.target.id;
                      if (modalId === "rejectAllObligationModal") {
                        orModule.initUpdateAllObligationStatus(
                          "rejectAllObligationModal",
                          "obligationRequest",
                          "rejected",
                          obligationFilter
                        );
                      } else if (modalId === "approveAllObligationModal") {
                        orModule.initUpdateAllObligationStatus(
                          "approveAllObligationModal",
                          "obligationRequest",
                          "approved",
                          obligationFilter
                        );
                      }
                    }
                  );

                  if (filter) {
                    filter.addEventListener("input", () => {
                      localStorage.setItem("obligationFilter", filter.value);
                      orModule.initFetchOr(filter.value);
                    });
                  }
                }
            })
    }

  function attachDynamicEventListeners() {
    const viewScheduleBtn = document.getElementById("viewScheduleBtn");
    const viewPrBtn = document.getElementById("viewPrBtn");
    const viewRisBtn = document.getElementById("viewRisBtn");
    const viewPcBtn = document.getElementById("viewPcBtn");
    const viewVBtn = document.getElementById("viewVBtn");
    const viewOrBtn = document.getElementById("viewOrBtn");
    const viewFranchiseBtn = document.getElementById("viewFranchiseBtn");
    if (viewScheduleBtn) {
      viewScheduleBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("schedule.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const scheduleBtn = document.getElementById("scheduleBtn");

        if (scheduleBtn) {
          scheduleBtn.classList.add("active");
          localStorage.setItem("activeIconId", "scheduleBtn");
        }
      });
    }
    if (viewPrBtn) {
      viewPrBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("purchaseRequest.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const scheduleBtn = document.getElementById("PRBtn");

        if (scheduleBtn) {
          scheduleBtn.classList.add("active");
          localStorage.setItem("activeIconId", "PRBtn");
        }
      });
    }
    if (viewRisBtn) {
      viewRisBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("requisition.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const risBtn = document.getElementById("RISBtn");

        if (risBtn) {
          risBtn.classList.add("active");
          localStorage.setItem("activeIconId", "RISBtn");
        }
      });
    }
    if (viewPcBtn) {
      viewPcBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("pettyCash.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const pcBtn = document.getElementById("pettyCashBtn");

        if (pcBtn) {
          pcBtn.classList.add("active");
          localStorage.setItem("activeIconId", "pettyCashBtn");
        }
      });
    }
    if (viewVBtn) {
      viewVBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("voucher.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const voucherBtn = document.getElementById("voucherBtn");

        if (voucherBtn) {
          voucherBtn.classList.add("active");
          localStorage.setItem("activeIconId", "voucherBtn");
        }
      });
    }
    if (viewOrBtn) {
      viewOrBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("obligation.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const orBtn = document.getElementById("ORBtn");

        if (orBtn) {
          orBtn.classList.add("active");
          localStorage.setItem("activeIconId", "ORBtn");
        }
      });
    }
    if (viewFranchiseBtn) {
      viewFranchiseBtn.addEventListener("click", async (e) => {
        e.preventDefault();

        await loadPage("franchise.html");

        // Update active sidebar icon to scheduleBtn
        const sidebarIcons = document.querySelectorAll(".sidebar-icon");
        sidebarIcons.forEach((i) => i.classList.remove("active"));

        const franchiseBtn = document.getElementById("franchiseBtn");

        if (franchiseBtn) {
          franchiseBtn.classList.add("active");
          localStorage.setItem("activeIconId", "franchiseBtn");
        }
      });
    }
  }

  if (scheduleBtn) {
    scheduleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("schedule.html");
    });
  }

  if (viewScheduleBtn) {
    viewScheduleBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("schedule.html");
    });
  }

  if (homeBtn) {
    homeBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("home.html");
    });
  }

  if (prBtn) {
    prBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("purchaseRequest.html");
    });
  }

  if(pettyCashBtn) {
    pettyCashBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("pettyCash.html")
    })
  }

  if(RISBtn) {
    RISBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("requisition.html")
    })
  }

  if(voucherBtn) {
    voucherBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("voucher.html")
    })
  }

  if(franchiseBtn) {
    franchiseBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("franchise.html")
    })
  }

  if(ORBtn) {
    ORBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("obligation.html")
    })
  }

  if(settingsBtn) {
    settingsBtn.addEventListener("click", async (e) => {
      e.preventDefault();
      await loadPage("settings.html")
    })
  }

  const currentPage = localStorage.getItem("currentPage");
  if (currentPage) {
    await loadPage(currentPage);
  } else {
    await loadPage("home.html");
  }

  // Select all sidebar icons
  const sidebarIcons = document.querySelectorAll(".sidebar-icon");

  sidebarIcons.forEach((icon) => {
    icon.addEventListener("click", () => {
      // Remove 'active' class from all icons
      sidebarIcons.forEach((i) => i.classList.remove("active"));

      // Add 'active' class to the clicked icon
      icon.classList.add("active");

      // Store active icon id in localStorage
      localStorage.setItem("activeIconId", icon.id);
    });
  });

  // On page load, set active icon from localStorage
  const activeIconId = localStorage.getItem("activeIconId");
  if (activeIconId) {
    const activeIcon = document.getElementById(activeIconId);
    if (activeIcon) {
      sidebarIcons.forEach((i) => i.classList.remove("active"));
      activeIcon.classList.add("active");
    }
  } else {
    // Optionally set default active icon, e.g., homeBtn
    if (homeBtn) {
      sidebarIcons.forEach((i) => i.classList.remove("active"));
      homeBtn.classList.add("active");
    }
  }
})
