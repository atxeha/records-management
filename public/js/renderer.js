
document.addEventListener("DOMContentLoaded", async () => {
  const scheduleBtn = document.getElementById("scheduleBtn");
  const viewScheduleBtn = document.getElementById("viewScheduleBtn");
  const homeBtn = document.getElementById("homeBtn");
  const prBtn = document.getElementById("PRBtn");
  const pettyCashBtn = document.getElementById("pettyCashBtn");
  const RISBtn = document.getElementById("RISBtn");
  const voucherBtn = document.getElementById("voucherBtn");
  const franchiseBtn = document.getElementById("franchiseBtn");

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
                        console.log(modalId)
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

                  let modalId = "";

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
                  franchiseModule.initEditFranchise();
                  franchiseModule.initFetchFranchise(franchiseFilter);
                  // franchiseModule.initApproveRejectfranchise(franchiseFilter);
                  franchiseModule.initDeleteAllFranchise();
                  franchiseModule.initDeleteFranchise(franchiseFilter);
                  franchiseModule.initPopulateFranchise();

                  // document.addEventListener("shown.bs.modal", function (event) {
                  //   modalId = event.target.id;
                  //   if (modalId === "rejectAllVoucherModal") {
                  //     voucherModule.initUpdateAllVoucherStatus(
                  //       "rejectAllVoucherModal",
                  //       "voucher",
                  //       "rejected",
                  //       voucherFilter
                  //     );
                  //   } else if (modalId === "approveAllVoucherModal") {
                  //     voucherModule.initUpdateAllVoucherStatus(
                  //       "approveAllVoucherModal",
                  //       "voucher",
                  //       "approved",
                  //       voucherFilter
                  //     );
                  //   }
                  // });

                  if (filter) {
                    filter.addEventListener("input", () => {
                      localStorage.setItem("franchiseFilter", filter.value);
                      franchiseModule.initFetchFranchise(filter.value);
                    });
                  }
                }
            })
            .catch((error) => console.error("Error loading page:", error));
    }

  function attachDynamicEventListeners() {
    const viewScheduleBtn = document.getElementById("viewScheduleBtn");
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
