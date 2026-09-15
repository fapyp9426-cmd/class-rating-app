// ===================== BIRTHDAYS =====================

import {
    studentsCol,
    onSnapshot,
    updateDoc,
    doc
} from "./firebase.js";

// =====================================================
// ДАТЫ РОЖДЕНИЯ
// =====================================================

const birthdayDates = {
    "Шумков Елисей": "2012-09-07",
    "Таран Вадим": "2012-09-21",
    "Мочалова Мария": "2012-10-12",
    "Суслин Александр": "2012-10-24",
    "Волосков Дмитрий": "2012-10-24",
    "Ваганов Алексей": "2011-11-04",
    "Ромашин Илья": "2012-11-09",
    "Демахин Илья": "2011-11-26",
    "Гатауллин Максим": "2011-12-01",
    "Дружинин Тимофей": "2011-12-03",
    "Восканян Милена": "2012-12-14",
    "Мухин Владислав": "2011-12-24",
    "Боронило Демид": "2012-01-01",
    "Старков Александр": "2012-01-04",
    "Мансуров Глеб": "2012-01-06",
    "Ларская Полина": "2012-01-30",
    "Виль Дмитрий": "2012-02-18",
    "Нуриева Амина": "2012-02-28",
    "Резвушкина София": "2012-03-08",
    "Каримов Илья": "2012-03-13",
    "Орлов Дмитрий": "2012-03-16",
    "Бабажанов Марсель": "2012-03-21",
    "Меграбян Рачик": "2012-03-31",
    "Орлов Артём": "2013-04-29",
    "Нетунаев Арсений": "2012-05-17",
    "Крюкова Маргарита": "2012-05-23",
    "Тиунов Максим": "2012-05-30",
    "Стройкина Анастасия": "2012-06-09",
    "Пономарёва Мария": "2012-06-10",
    "Габдулхаков Матвей": "2011-06-22",
    "Яновская Василиса": "2012-06-25",
    "Кылосова Анна": "2012-07-12",
    "Сапёров Матвей": "2012-08-25"
};

// =====================================================
// МЕСЯЦЫ
// =====================================================

const MONTHS = [
    "января",
    "февраля",
    "марта",
    "апреля",
    "мая",
    "июня",
    "июля",
    "августа",
    "сентября",
    "октября",
    "ноября",
    "декабря"
];

// =====================================================
// ДАТЫ
// =====================================================

function parseBirthday(value) {
    if (!value) return null;

    const [year, month, day] = value.split("-").map(Number);

    if (!year || !month || !day) {
        return null;
    }

    return {
        year,
        month,
        day
    };
}

function isLeapYear(year) {
    return (
        year % 4 === 0 &&
        (year % 100 !== 0 || year % 400 === 0)
    );
}

function getBirthdayDateForYear(birthday, year) {
    let day = birthday.day;

    // 29 февраля → 28 февраля в невисокосный год
    if (
        birthday.month === 2 &&
        birthday.day === 29 &&
        !isLeapYear(year)
    ) {
        day = 28;
    }

    return new Date(
        year,
        birthday.month - 1,
        day
    );
}

function getNextBirthdayDate(birthday, today = new Date()) {
    const currentYear = today.getFullYear();

    let next = getBirthdayDateForYear(
        birthday,
        currentYear
    );

    const todayWithoutTime = new Date(
        today.getFullYear(),
        today.getMonth(),
        today.getDate()
    );

    if (next < todayWithoutTime) {
        next = getBirthdayDateForYear(
            birthday,
            currentYear + 1
        );
    }

    return next;
}

function daysBetween(from, to) {
    const a = new Date(
        from.getFullYear(),
        from.getMonth(),
        from.getDate()
    );

    const b = new Date(
        to.getFullYear(),
        to.getMonth(),
        to.getDate()
    );

    const diff = b - a;

    return Math.round(
        diff / (1000 * 60 * 60 * 24)
    );
}

function isBirthdayToday(birthday, today = new Date()) {
    if (!birthday) return false;

    const monthMatches =
        birthday.month === today.getMonth() + 1;

    let dayMatches =
        birthday.day === today.getDate();

    // 29 февраля → 28 февраля в невисокосный год
    if (
        birthday.month === 2 &&
        birthday.day === 29 &&
        !isLeapYear(today.getFullYear())
    ) {
        dayMatches = today.getDate() === 28;
    }

    return monthMatches && dayMatches;
}

function getAge(birthday, today = new Date()) {
    let age =
        today.getFullYear() -
        birthday.year;

    const birthdayThisYear =
        getBirthdayDateForYear(
            birthday,
            today.getFullYear()
        );

    if (today < birthdayThisYear) {
        age--;
    }

    return age;
}

// =====================================================
// ФОРМАТИРОВАНИЕ
// =====================================================

function formatBirthdayDate(birthday) {
    return `${birthday.day} ${MONTHS[birthday.month - 1]}`;
}

function formatDaysLeft(days) {
    if (days === 0) {
        return "Сегодня 🎂";
    }

    if (days === 1) {
        return "через 1 день";
    }

    if (
        days >= 2 &&
        days <= 4
    ) {
        return `через ${days} дня`;
    }

    return `через ${days} дней`;
}

// =====================================================
// ПОДГОТОВКА ДАННЫХ
// =====================================================

function prepareBirthdays(students) {
    const today = new Date();

    return students
        .map(student => {
            const birthdayValue =
                student.birthday ||
                birthdayDates[student.name];

            if (!birthdayValue) {
                return null;
            }

            const birthday =
                parseBirthday(birthdayValue);

            if (!birthday) {
                return null;
            }

            const nextBirthday =
                getNextBirthdayDate(
                    birthday,
                    today
                );

            const daysLeft =
                daysBetween(
                    today,
                    nextBirthday
                );

            return {
                ...student,

                birthday: birthdayValue,
                birthdayParsed: birthday,
                nextBirthday,
                daysLeft
            };
        })
        .filter(Boolean)
        .sort((a, b) => {
            if (a.daysLeft !== b.daysLeft) {
                return a.daysLeft - b.daysLeft;
            }

            return a.name.localeCompare(
                b.name,
                "ru"
            );
        });
}

// =====================================================
// ГЛАВНАЯ КАРТОЧКА
// =====================================================

function renderNextBirthday(birthday) {
    const card =
        document.getElementById(
            "birthday-next"
        );

    const avatar =
        document.getElementById(
            "birthday-next-avatar"
        );

    const name =
        document.getElementById(
            "birthday-next-name"
        );

    const date =
        document.getElementById(
            "birthday-next-date"
        );

    const countdown =
        document.getElementById(
            "birthday-next-countdown"
        );

    if (
        !card ||
        !avatar ||
        !name ||
        !date ||
        !countdown
    ) {
        return;
    }

    const isToday =
        isBirthdayToday(
            birthday.birthdayParsed
        );

    avatar.textContent =
        birthday.avatar || "🙂";

    name.textContent =
        birthday.name;

    card.classList.toggle(
        "is-today",
        isToday
    );

    if (isToday) {
        const label =
            card.querySelector(
                ".birthday-next-label"
            );

        if (label) {
            label.textContent =
                "🎂 СЕГОДНЯ ДЕНЬ РОЖДЕНИЯ!";
        }

        date.textContent =
            `Исполняется ${getAge(
                birthday.birthdayParsed
            )} лет`;

        countdown.textContent =
            "Поздравляем! 🎉";

        return;
    }

    const label =
        card.querySelector(
            ".birthday-next-label"
        );

    if (label) {
        label.textContent =
            "СЛЕДУЮЩИЙ ДЕНЬ РОЖДЕНИЯ";
    }

    date.textContent =
        formatBirthdayDate(
            birthday.birthdayParsed
        );

    countdown.textContent =
        formatDaysLeft(
            birthday.daysLeft
        );
}

// =====================================================
// СПИСОК
// =====================================================

function renderBirthdayList(birthdays) {
    const container =
        document.getElementById(
            "birthdays-list"
        );

    if (!container) {
        return;
    }

    container.innerHTML = "";

    birthdays.forEach(birthday => {
        const row =
            document.createElement("div");

        row.className =
            "birthday-row";

        const avatar =
            document.createElement("div");

        avatar.className =
            "birthday-row-avatar";

        avatar.textContent =
            birthday.avatar || "🙂";

        const info =
            document.createElement("div");

        info.className =
            "birthday-row-info";

        const studentName =
            document.createElement("div");

        studentName.className =
            "birthday-row-name";

        studentName.textContent =
            birthday.name;

        const studentDate =
            document.createElement("div");

        studentDate.className =
            "birthday-row-date";

        studentDate.textContent =
            formatBirthdayDate(
                birthday.birthdayParsed
            );

        info.appendChild(studentName);
        info.appendChild(studentDate);

        const countdown =
            document.createElement("div");

        countdown.className =
            "birthday-row-countdown";

        countdown.textContent =
            formatDaysLeft(
                birthday.daysLeft
            );

        row.appendChild(avatar);
        row.appendChild(info);
        row.appendChild(countdown);

        container.appendChild(row);
    });
}

// =====================================================
// FIREBASE
// =====================================================

function loadBirthdaysFromFirebase() {
    onSnapshot(
        studentsCol,
        snapshot => {
            const students =
                snapshot.docs.map(
                    studentDoc => ({
                        id: studentDoc.id,
                        ...studentDoc.data()
                    })
                );

            const birthdays =
                prepareBirthdays(students);

            if (!birthdays.length) {
                console.warn(
                    "Дни рождения: подходящих данных пока нет."
                );

                return;
            }

            renderNextBirthday(
                birthdays[0]
            );

            renderBirthdayList(
                birthdays
            );
        },
        error => {
            console.error(
                "Ошибка загрузки дней рождения:",
                error
            );
        }
    );
}

// =====================================================
// INIT
// =====================================================

function initBirthdays() {
    loadBirthdaysFromFirebase();
}

document.addEventListener(
    "DOMContentLoaded",
    initBirthdays
);

// =====================================================
// /BIRTHDAYS
// =====================================================