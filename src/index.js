'use strict';

import { initToday, showNoToday } from './modules/today';
import initUpcoming from './modules/upcoming';
import { format, isYesterday, isPast, isToday } from 'date-fns';
import { initProject } from './modules/projects';

const todo = (description, dueDate, DOMDate, priority, project) => {
    return { description, dueDate, DOMDate, priority, project };
};

function switchPage(title, isInbox) {
    document.getElementById('projectChooserText').textContent = 'Default';
    document.querySelectorAll('.taskList').forEach((task) => (task.style.display = 'flex'));
    document.getElementById('currentPageTitle').textContent = title;
    document.getElementById('noToday').style.display = 'none';
    document.querySelectorAll('.upcoming').forEach((ele) => ele.remove());
    document.getElementById('form').style.display = 'none';
    document.getElementById('formSubmit').style.display = 'none';
    if (isInbox) {
        document.getElementById('add').style.display = 'flex';
    } else {
        document.getElementById('add').style.display = 'none';
    }
}

function initInbox() {
    switchPage('Inbox', true);
    const showAllTasks = () => {
        document.querySelectorAll('.taskList').forEach((task) => (task.style.display = 'flex'));
    };
    showAllTasks();
}

let taskArray = [];
let projectArray = [];

const addTask = (() => {
    const showInterface = () => {
        document.getElementById('form').style.display = 'block';
        document.getElementById('formSubmit').style.display = 'flex';
        document.getElementById('add').style.display = 'none';
    };
    const reset = () => {
        document.getElementById('taskText').value = '';
        document.getElementById('datepicker').value = '';
        document.getElementById('priorityChooserText').textContent = '!';
        document.getElementById('projectChooserText').textContent = 'Default';
    };
    const manageDate = () => {
        const current = new Date();
        const HMS = ` ${current.getHours()}:${current.getMinutes()}:${current.getSeconds()}`;
        const datepickerValue = document.getElementById('datepicker').value;
        const fullDate = datepickerValue != '' ? datepickerValue + HMS : datepickerValue;
        const oldDate = new Date(fullDate || 1111 - 11 - 11);
        let oldDateFormatted = format(oldDate, 'yyyy-MM-dd HH:mm:ss');
        let date = format(oldDate, 'd/M/yyyy');
        if (isYesterday(oldDate)) date = 'Yesterday';
        if (isToday(oldDate)) date = 'Today';
        if (date === '1/1/1970') date = '';
        if (oldDateFormatted === '1970-01-01 09:00:01') oldDateFormatted = '';
        return { date, oldDateFormatted, oldDate };
    };
    const createTask = () => {
        const description = document.getElementById('taskText').value;
        const dueDate = manageDate().oldDateFormatted;
        const DOMDate = manageDate().date;
        const priority = document.getElementById('priorityChooserText').textContent;
        const project = document.getElementById('projectChooserText').textContent;
        return todo(description, dueDate, DOMDate, priority, project);
    };
    const changeOpacity = () => {
        if (document.getElementById('taskText').value === '') document.getElementById('submit').style.opacity = 0.5;
        else document.getElementById('submit').style.opacity = 1;
    };
    const hideInterface = () => {
        document.getElementById('form').style.display = 'none';
        document.getElementById('formSubmit').style.display = 'none';
        document.getElementById('add').style.display = 'flex';
        reset();
        changeOpacity();
    };
    const removeTask = function () {
        const local = JSON.parse(localStorage.getItem('task'));
        const checkTitleToday = () => {
            if (document.getElementById('currentPageTitle').innerText === `Today ${new Date().toDateString()}`) {
                if (!local.some((task) => isToday(new Date(task.dueDate)))) showNoToday();
            }
        };
        const checkTitleUpcoming = () => {
            if (document.getElementById('currentPageTitle').innerText === `Upcoming`) {
                if (local.length === 0) {
                    showNoToday();
                    document.getElementById('noToday').innerText = 'No upcoming tasks';
                }
            }
        };
        this.parentNode.parentNode.remove();
        for (let i = 0; i < taskArray.length; i++) {
            if (taskArray[i].description === this.nextSibling.textContent) {
                taskArray.splice(i, 1);
            }
        }
        localStorage.setItem('task', JSON.stringify(taskArray));
        checkTitleToday();
        checkTitleUpcoming();
    };
    const pushStorage = (array, item, push) => {
        array = JSON.parse(localStorage.getItem(item));
        if (array == null) array = [];
        array.push(push);
        localStorage.setItem(item, JSON.stringify(array));
    };
    const collapseContent = function (e) {
        if (e.target.className === 'projectChooser' || e.target.className.includes('projectCreatorInput'))
            document.getElementById('projectChooserCol').style.display = 'block';
        else document.getElementById('projectChooserCol').style.display = 'none';
        if (e.target.id === 'priorityChooserText')
            document.getElementById('priorityChooserCol').style.display = 'block';
        else document.getElementById('priorityChooserCol').style.display = 'none';
    };
    const expandProjects = () => {
        document.getElementById('chevron').textContent =
            document.getElementById('chevron').textContent === 'chevron_right' ? 'expand_more' : 'chevron_right';
        document.getElementById('projectsCollapse').style.transform =
            document.getElementById('projectsCollapse').style.transform === 'scaleY(1)' ? 'scaleY(0)' : 'scaleY(1)';
    };

    const selectChildPriority = function () {
        document.getElementById('priorityChooserText').textContent =
            this.textContent === 'Priority Low' ? '!' : this.textContent === 'Priority Medium' ? '!!' : '!!!';
    };
    const selectProject = function () {
        document.getElementById('projectChooserText').textContent = this.textContent;
    };
    const removeProject = function () {
        this.parentNode.remove();
        this.parentNode.removeEventListener('click', initProject);
        const removeProjectArray = () => {
            for (let i = 0; i < projectArray.length; i++) {
                const thisText = this.parentNode.firstElementChild.textContent;
                const lists = document.querySelectorAll('.projectList');
                if (projectArray[i] === thisText) projectArray.splice(i, 1);
                if (lists[i + 1].textContent === thisText) lists[i + 1].remove();
            }
            localStorage.setItem('project', JSON.stringify(projectArray));
        };
        removeProjectArray();
        initInbox();
    };
    const createProject = (context) => {
        const element = document.createElement('li');
        document.getElementById('projectChooserCol').appendChild(element);
        element.className = 'projectChoice projectList';
        const span = element.appendChild(document.createElement('span'));
        span.textContent = context;
        element.addEventListener('click', selectProject);
        document.getElementById('projectChooserText').textContent = context;
    };
    const createProjectTab = (context) => {
        const collapse = document.getElementById('projectsCollapse');
        const under = collapse.appendChild(document.createElement('p'));
        under.className = 'projectsUnder';
        under.appendChild(document.createElement('span')).textContent = context;
        const cross = document.createElement('span');
        under.appendChild(cross);
        cross.className = 'material-icons cross';
        cross.textContent = 'clear';
        under.addEventListener('click', initProject);
        cross.addEventListener('click', removeProject);
    };
    const manageProject = () => {
        let text = document.getElementById('projectCreatorInput').value;
        if (text === '') {
            alert('Please input more than one word');
            return;
        }
        const lists = document.querySelectorAll('.projectList');
        for (let i = 0; i < lists.length; i++) {
            if (text === lists[i].textContent) {
                alert('This project already exists');
                document.getElementById('projectCreator').reset();
                return;
            }
        }
        document.getElementById('projectCreator').reset();

        pushStorage(projectArray, 'project', text);
        const lastProject = text
        createProject(lastProject);
        createProjectTab(lastProject);
    };

    const changeColor = () => {
        const priority = document.querySelectorAll('.priority');
        const dates = document.querySelectorAll('.date');
        const local = JSON.parse(localStorage.getItem('task'));
        for (let i = 0; i < local.length; i++) {
            priority[i].style.color =
                local[i].priority.length === 1 ? 'green' : local[i].priority.length === 2 ? 'blue' : 'red';
            dates[i].style.color =
                local[i].DOMDate === 'Today' ? 'blue' : isPast(new Date(local[i].dueDate)) ? 'red' : 'black';
        }
    };

    const createTaskDOM = (des, DOMDate, proj, pri, detailed) => {
        const list = document.createElement('li');
        document.getElementById('form').before(list);
        list.className = 'taskList';

        const div1 = list.appendChild(document.createElement('div'));
        const div2 = list.appendChild(document.createElement('div'));
        const bullet = div1.appendChild(document.createElement('div'));
        const text = div1.appendChild(document.createElement('p'));
        const date = div2.appendChild(document.createElement('p'));
        const project = div2.appendChild(document.createElement('div'));
        const priority = div2.appendChild(document.createElement('p'));

        div1.className = 'listInside';
        div2.className = 'listInside';
        bullet.className = 'bullet';
        project.className = 'project';
        date.className = 'date';
        priority.className = 'priority';
        text.className = 'description';
        text.textContent = des;
        date.textContent = DOMDate;
        project.textContent = proj;
        priority.textContent = pri;

        const checkTodayYesterday = () => {
            //needed a new date format
            if (DOMDate === 'Today') {
                if (!isToday(new Date(detailed)) && isYesterday(new Date(detailed))) {
                    DOMDate = 'Yesterday';
                    return;
                }
                if (!isToday(new Date(detailed)) && !isYesterday(new Date(detailed))) {
                    DOMDate = detailed;
                    return;
                }
            }
            if (DOMDate === 'Yesterday') {
                if (!isYesterday(new Date(detailed))) DOMDate = detailed;
            }
        };

        checkTodayYesterday();
        bullet.addEventListener('click', removeTask);
    };

    const DOMTask = () => {
        if (createTask().description === '') return;
        createTaskDOM(createTask().description, createTask().DOMDate, createTask().project, createTask().priority);
        pushStorage(taskArray, 'task', createTask());
        changeColor();
        reset();
        changeOpacity();
    };
    const addListeners = () => {
        document.getElementById('add').addEventListener('click', showInterface);
        document.getElementById('cancel').addEventListener('click', hideInterface);
        document.getElementById('projects').addEventListener('click', expandProjects);
        document.getElementById('submit').addEventListener('click', DOMTask);
        document.getElementById('today').addEventListener('click', initToday);
        document.getElementById('upcoming').addEventListener('click', initUpcoming);
        document.getElementById('inbox').addEventListener('click', initInbox);
        document.getElementById('projectCreatorPlus').addEventListener('click', manageProject);
        document.querySelectorAll('.projectList').forEach((p) => p.addEventListener('click', selectProject));
        document
            .querySelectorAll('.priorityChooserColChoice')
            .forEach((p) => p.addEventListener('click', selectChildPriority));
        document.querySelectorAll('.projectsUnder').forEach((p) => p.addEventListener('click', initProject));
        document.getElementById('taskText').addEventListener('keyup', changeOpacity);
        document.addEventListener('click', collapseContent);
    };
    return { addListeners, createTaskDOM, changeColor, createProject, createProjectTab };
})();

function initStorage() {
    if (localStorage.key(0) == null) return
    const taskParsed = JSON.parse(localStorage.getItem('task'));
    taskArray = taskParsed;
    for (let i = 0; i < taskParsed.length; i++) {
        addTask.createTaskDOM(
            taskParsed[i].description,
            taskParsed[i].DOMDate,
            taskParsed[i].project,
            taskParsed[i].priority,
            taskParsed[i].dueDate
        );
    }
    if (localStorage.key(1) == null) return;
    const projectParsed = JSON.parse(localStorage.getItem('project'));
    projectArray = projectParsed;
    for (let i = 0; i < projectParsed.length; i++) {
        addTask.createProject(projectParsed[i]);
        addTask.createProjectTab(projectParsed[i]);
    }
    addTask.changeColor();
}

initStorage();

addTask.addListeners();
window.onload = () => (document.getElementById('datepicker').min = format(new Date(), 'yyyy-MM-dd'));

export { switchPage };
