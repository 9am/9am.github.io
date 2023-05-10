const num = 20;
const clock = document.querySelector('.clock');
clock.style.setProperty('--surface-num', num);
const cCase = clock.querySelector('.case');
cCase.appendChild(
    Array.from({ length: num }).reduce(fragment => {
        const li = document.createElement('li');
        fragment.appendChild(li);
        return fragment;
    }, document.createDocumentFragment())
);
const slice = Math.PI * 2 / num;
[...cCase.children].forEach((face, index) => {
    face.style.setProperty('--rotation', `${index * slice}rad`);
});

clock.style.setProperty('--case-color', `hsl(${Math.random()}turn 60% 45% / .2)`);
clock.style.setProperty('--hand-color', `hsl(${Math.random()}turn 60% 45% / .4)`);
clock.style.setProperty('--stroke-color', `hsl(${Math.random()}turn 60% 45% / .6)`);
