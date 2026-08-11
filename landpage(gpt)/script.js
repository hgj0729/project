document.addEventListener(
  "DOMContentLoaded",
  function () {

    /* =========================================
       DOM
    ========================================== */

    const modal =
      document.getElementById(
        "contactModal"
      );


    const modalOpenButtons =
      document.querySelectorAll(
        "[data-modal-open]"
      );


    const modalCloseButton =
      document.getElementById(
        "modalClose"
      );


    const successCloseButton =
      document.getElementById(
        "successClose"
      );


    const formView =
      document.getElementById(
        "modalFormView"
      );


    const successView =
      document.getElementById(
        "modalSuccessView"
      );


    const contactForm =
      document.getElementById(
        "contactForm"
      );


    const customerName =
      document.getElementById(
        "customerName"
      );


    const customerEmail =
      document.getElementById(
        "customerEmail"
      );


    const customerPhone =
      document.getElementById(
        "customerPhone"
      );


    const privacyAgree =
      document.getElementById(
        "privacyAgree"
      );


    const nameError =
      document.getElementById(
        "nameError"
      );


    const emailError =
      document.getElementById(
        "emailError"
      );


    const phoneError =
      document.getElementById(
        "phoneError"
      );


    const privacyError =
      document.getElementById(
        "privacyError"
      );



    /* =========================================
       필수 DOM 존재 여부 확인
    ========================================== */

    if (!modal) {

      console.error(
        "contactModal을 찾을 수 없습니다."
      );

      return;

    }


    if (
      modalOpenButtons.length === 0
    ) {

      console.error(
        "data-modal-open CTA 버튼을 찾을 수 없습니다."
      );

    }



    /* =========================================
       MODAL OPEN
    ========================================== */

    function openModal() {

      modal.classList.add(
        "is-open"
      );


      modal.setAttribute(
        "aria-hidden",
        "false"
      );


      document.body.classList.add(
        "modal-open"
      );


      /*
        폼 화면 먼저 노출
      */

      formView.style.display =
        "block";


      successView.classList.remove(
        "is-active"
      );


      /*
        이름 입력칸 포커스
      */

      setTimeout(
        function () {

          customerName.focus();

        },
        100
      );

    }



    /* =========================================
       MODAL CLOSE
    ========================================== */

    function closeModal() {

      modal.classList.remove(
        "is-open"
      );


      modal.setAttribute(
        "aria-hidden",
        "true"
      );


      document.body.classList.remove(
        "modal-open"
      );


      resetForm();

    }



    /* =========================================
       모든 CTA에 클릭 이벤트 등록
    ========================================== */

    modalOpenButtons.forEach(
      function (button) {

        button.addEventListener(
          "click",
          function (event) {

            event.preventDefault();

            event.stopPropagation();

            openModal();

          }
        );

      }
    );



    /* =========================================
       X 버튼 닫기
    ========================================== */

    modalCloseButton.addEventListener(
      "click",
      function () {

        closeModal();

      }
    );



    /* =========================================
       성공 확인 버튼
    ========================================== */

    successCloseButton.addEventListener(
      "click",
      function () {

        closeModal();

      }
    );



    /* =========================================
       ESC 닫기
    ========================================== */

    document.addEventListener(
      "keydown",
      function (event) {

        if (
          event.key === "Escape" &&
          modal.classList.contains(
            "is-open"
          )
        ) {

          closeModal();

        }

      }
    );



    /* =========================================
       전화번호 자동 "-"
    ========================================== */

    customerPhone.addEventListener(
      "input",
      function () {

        let number =
          customerPhone.value.replace(
            /[^0-9]/g,
            ""
          );


        number =
          number.slice(
            0,
            11
          );


        if (
          number.length <= 3
        ) {

          customerPhone.value =
            number;

        }

        else if (
          number.length <= 7
        ) {

          customerPhone.value =
            number.slice(
              0,
              3
            ) +
            "-" +
            number.slice(
              3
            );

        }

        else {

          customerPhone.value =
            number.slice(
              0,
              3
            ) +
            "-" +
            number.slice(
              3,
              7
            ) +
            "-" +
            number.slice(
              7,
              11
            );

        }

      }
    );



    /* =========================================
       ERROR
    ========================================== */

    function addError(
      input,
      errorElement,
      message
    ) {

      input
        .closest(
          ".form-group"
        )
        .classList.add(
          "has-error"
        );


      errorElement.textContent =
        message;

    }


    function removeError(
      input,
      errorElement
    ) {

      input
        .closest(
          ".form-group"
        )
        .classList.remove(
          "has-error"
        );


      errorElement.textContent =
        "";

    }



    /* =========================================
       이름 검사
    ========================================== */

    function validateName() {

      const value =
        customerName
          .value
          .trim();


      if (
        value === ""
      ) {

        addError(
          customerName,
          nameError,
          "이름을 입력해주세요."
        );


        return false;

      }


      removeError(
        customerName,
        nameError
      );


      return true;

    }



    /* =========================================
       이메일 검사
    ========================================== */

    function validateEmail() {

      const value =
        customerEmail
          .value
          .trim();


      const emailPattern =
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/;


      if (
        value === ""
      ) {

        addError(
          customerEmail,
          emailError,
          "이메일 주소를 입력해주세요."
        );


        return false;

      }


      if (
        !emailPattern.test(
          value
        )
      ) {

        addError(
          customerEmail,
          emailError,
          "올바른 이메일 주소를 입력해주세요."
        );


        return false;

      }


      removeError(
        customerEmail,
        emailError
      );


      return true;

    }



    /* =========================================
       전화번호 검사
    ========================================== */

    function validatePhone() {

      const value =
        customerPhone
          .value
          .trim();


      const phonePattern =
        /^01[016789]-\d{3,4}-\d{4}$/;


      if (
        value === ""
      ) {

        addError(
          customerPhone,
          phoneError,
          "전화번호를 입력해주세요."
        );


        return false;

      }


      if (
        !phonePattern.test(
          value
        )
      ) {

        addError(
          customerPhone,
          phoneError,
          "올바른 전화번호를 입력해주세요."
        );


        return false;

      }


      removeError(
        customerPhone,
        phoneError
      );


      return true;

    }



    /* =========================================
       개인정보 검사
    ========================================== */

    function validatePrivacy() {

      if (
        !privacyAgree.checked
      ) {

        privacyError.textContent =
          "개인정보 수집 및 이용에 동의해주세요.";


        return false;

      }


      privacyError.textContent =
        "";


      return true;

    }



    /* =========================================
       실시간 검증
    ========================================== */

    customerName.addEventListener(
      "input",
      function () {

        if (
          customerName.value.trim()
        ) {

          removeError(
            customerName,
            nameError
          );

        }

      }
    );


    customerEmail.addEventListener(
      "input",
      function () {

        if (
          customerEmail.value.trim()
        ) {

          removeError(
            customerEmail,
            emailError
          );

        }

      }
    );


    customerPhone.addEventListener(
      "input",
      function () {

        if (
          customerPhone.value.trim()
        ) {

          removeError(
            customerPhone,
            phoneError
          );

        }

      }
    );


    privacyAgree.addEventListener(
      "change",
      function () {

        if (
          privacyAgree.checked
        ) {

          privacyError.textContent =
            "";

        }

      }
    );



    /* =========================================
       FORM SUBMIT
    ========================================== */

    contactForm.addEventListener(
      "submit",
      function (event) {

        event.preventDefault();


        const validName =
          validateName();


        const validEmail =
          validateEmail();


        const validPhone =
          validatePhone();


        const validPrivacy =
          validatePrivacy();



        if (
          !validName ||
          !validEmail ||
          !validPhone ||
          !validPrivacy
        ) {

          return;

        }



        /* =====================================
           사용자가 입력한 데이터
        ====================================== */

        const formData = {

          name:
            customerName
              .value
              .trim(),

          email:
            customerEmail
              .value
              .trim(),

          phone:
            customerPhone
              .value
              .trim()

        };


        console.log(
          "상담 신청:",
          formData
        );


        /*
          추후 서버 연결 시 아래와 같이
          fetch를 사용하면 됩니다.

          fetch(
            "/api/contact",
            {
              method: "POST",

              headers: {
                "Content-Type":
                  "application/json"
              },

              body:
                JSON.stringify(
                  formData
                )
            }
          );
        */


        showSuccess();

      }
    );



    /* =========================================
       SUCCESS VIEW
    ========================================== */

    function showSuccess() {

      formView.style.display =
        "none";


      successView.classList.add(
        "is-active"
      );

    }



    /* =========================================
       FORM RESET
    ========================================== */

    function resetForm() {

      contactForm.reset();


      nameError.textContent =
        "";


      emailError.textContent =
        "";


      phoneError.textContent =
        "";


      privacyError.textContent =
        "";


      document
        .querySelectorAll(
          ".form-group"
        )
        .forEach(
          function (group) {

            group.classList.remove(
              "has-error"
            );

          }
        );


      formView.style.display =
        "block";


      successView.classList.remove(
        "is-active"
      );

    }



    /* =========================================
       GNB Scroll
    ========================================== */

    const navLinks =
      document.querySelectorAll(
        ".gnb a"
      );


    navLinks.forEach(
      function (link) {

        link.addEventListener(
          "click",
          function (event) {

            const targetId =
              link.getAttribute(
                "href"
              );


            if (
              !targetId ||
              !targetId.startsWith(
                "#"
              )
            ) {

              return;

            }


            const target =
              document.querySelector(
                targetId
              );


            if (
              !target
            ) {

              return;

            }


            event.preventDefault();


            const header =
              document.querySelector(
                ".header"
              );


            const headerHeight =
              header.offsetHeight;


            const targetPosition =
              target.offsetTop -
              headerHeight;


            window.scrollTo(
              {
                top:
                  targetPosition,

                behavior:
                  "smooth"
              }
            );

          }
        );

      }
    );



    /* =========================================
       개발 확인
    ========================================== */

    console.log(
      "상담 팝업 JavaScript 정상 실행"
    );


    console.log(
      "연결된 CTA 개수:",
      modalOpenButtons.length
    );

  }
);