'use strict';

import { checkDate, showNoToday } from './today';
import { switchPage } from '..';
import { taskArray } from '..';
import { isPast, isToday, compareAsc } from 'date-fns';

function notShowToday() {
    if (taskArray.length === 0) {
        showNoToday();
        document.getElementById('noToday').innerText = 'No upcoming tasks';
        return;
    }
    const today = taskArray.filter((task) => isToday(new Date(task.dueDate)) || task.dueDate === '');
    for (let i = 0; i < taskArray.length; i++) {
        const des = document.querySelectorAll('.description');
        if (today.find((o) => o.description === des[i].innerText) != undefined)
            des[i].parentNode.parentNode.style.display = 'none';
    }
}

function getTaskListFiltered() {
    const taskList = document.querySelectorAll('.taskList');
    const taskListFiltered = Array.from(taskList).filter((task) => task.style.display === 'flex');
    return taskListFiltered;
}

function sortDOMDate() {
    const array = [];
    const dates = document.querySelectorAll('.date');
    dates.forEach((date) => array.push(new Date(date.innerText.split('/').reverse().join('-'))));
    const sorted = array.sort(compareAsc);
    let sortedFiltered = sorted.filter((o) => o != 'Invalid Date');
    sortedFiltered = sortedFiltered.map((o) => Date.parse(o));
    for (let i = 0; i < getTaskListFiltered().length; i++) {
        const parsed = Date.parse(
            new Date(getTaskListFiltered()[i].querySelector('.date').innerText.split('/').reverse().join('-'))
        );
        getTaskListFiltered()[i].style.order = sortedFiltered.findIndex((o) => o === parsed);
        const displayDates = () => {
            const p = document.createElement('p');
            document.getElementById('listContainer').appendChild(p);
            p.className = 'upcoming';
            p.innerText = isPast(parsed)
                ? 'Overdue'
                : getTaskListFiltered()[i].getElementsByClassName('date')[0].innerText;
            p.style.order = getTaskListFiltered()[i].style.order - 1;
            const ps = document.querySelectorAll('.upcoming')
            let count = 0
            for (let i = 0; i < ps.length; i++) {
                count = p.innerText === ps[i].innerText ? count+= 1 : count;
            }
            if (count > 1) p.remove()
        };
        displayDates();
    }
}

function initUpcoming() {
    checkDate('', false);
    switchPage('Upcoming tasks', false);
    notShowToday();
    sortDOMDate();
}

export default initUpcoming;
