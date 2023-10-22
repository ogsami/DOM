
// tää venaa et sivu on latautunu ja sit vast suorittaa koodii
document.addEventListener('DOMContentLoaded', () => {
    const todoForm = document.getElementById('todoForm');
    const todoInput = document.getElementById('todoInput');
    const todoLista = document.getElementById('todoLista');

    // haetaa tehtävät local storagest  
    loadTodos();

    todoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        // Tää tsekkaa onks pituus vähintää 3 merkkii ja jos ei nii tulee pieni kiva error viesti
        if (todoInput.value.trim() === '' || todoInput.value.length < 3) {
            todoInput.classList.add('error');
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = 'Syötä väh. 3 merkkiä :)';
            return;
        } else {
            // ja jos ei oo virheelline teksti nii tää poistaa sen error tekstin
            const errorMessage = document.getElementById('error-message');
            errorMessage.textContent = '';

            // ja sit lisää sen tehtäviin
            todoInput.classList.remove('error');
            const todo = {
                text: todoInput.value,
                completed: false
            };
    
            addTodoToList(todo);

            // ja tallentaa local storagee
            saveTodoToLocal(todo);
            todoInput.value = '';
        }

        

    });

    // täs on ohje nappulan toimintaa, eli voi "togglee" sitä
    const toggleInstructionsButton = document.getElementById('toggleOhjeita');
    const instructions = document.getElementById('ohjeita');

    toggleInstructionsButton.addEventListener('click', () => {
        if (instructions.style.display === 'none') {
            instructions.style.display = 'block';
        } else {
            instructions.style.display = 'none';
        }
    });

    // laitetaa tehtävät luokkii nii voi filtteröidä
    window.filterTodos = function (filter) {
        const todos = todoLista.children;
        Array.from(todos).forEach(todo => {
            switch (filter) {
                case 'active':
                    todo.style.display = todo.classList.contains('completed') ? 'none' : '';
                    break;
                case 'completed':
                    todo.style.display = todo.classList.contains('completed') ? '' : 'none';
                    break;
                default:
                    todo.style.display = '';
                    break;
            }
        });
    };

    // poistaa tehtäviä luokan mukaa
    window.deleteTodos = function (filter) {
        const todos = todoLista.children;

        Array.from(todos).forEach(todo => {
            switch (filter) {
                case 'all':
                    todo.remove();
                    break;
                case 'active':
                    if (!todo.classList.contains('completed')) {
                        todo.remove();
                    }
                    break;
                case 'completed':
                    if (todo.classList.contains('completed')) {
                        todo.remove();
                    }
                    break;
                default:
                    break;

            }
        // Päivittää laskuria
        updateTaskCounter();
        });

        updateLocalTodos(); 
    };

    // tää funktio lisää tehtävät listaan
    function addTodoToList(todo) {
        const li = document.createElement('li');
        li.textContent = todo.text;

        // ja tehään siit "raahattava"
        li.setAttribute('draggable', true);
        li.setAttribute('id', todo.text);

        if (todo.completed) {
            li.classList.add('completed');
        }

        li.addEventListener('click', () => {
            li.classList.toggle('completed');
            todo.completed = !todo.completed;
            // päivittää todot
            updateLocalTodos();
             // Päivittää laskuria
            updateTaskCounter(); 
        });
        
        // raahausta varten listenerit päälle
        li.addEventListener('dragstart', handleDragStart);
        li.addEventListener('dragover', handleDragOver);
        li.addEventListener('drop', handleDrop);
        li.addEventListener('dragenter', handleDragEnter);
        li.addEventListener('dragleave', handleDragLeave);

        // poista nappula
        const deleteBtn = document.createElement('button');
        deleteBtn.textContent = 'Poista';
        deleteBtn.addEventListener('click', () => {
            li.remove();
            removeTodoFromLocal(todo.text);
        });

        li.appendChild(deleteBtn);
        todoLista.appendChild(li);

        // Päivittää laskuria
        updateTaskCounter();  
    }


    // tää pitää kirjaa yllä siitä kui monta on tehty ja jälellä
    function updateTaskCounter() {
        const totalTasks = todoLista.children.length;
        const completedTasks = document.querySelectorAll('.completed').length;
        const taskCounter = document.getElementById('task-counter');
        taskCounter.textContent = `${completedTasks}/${totalTasks} tehty`;
    }


    ////////////////////////////////////////////////////////
    /// Drag and drop hommat, tää oli erittäin epä kivaa ///
    ////////////////////////////////////////////////////////


    // kertoo koodille et nyt raahataa jotai
    function handleDragStart(e) {
        e.dataTransfer.setData('text/plain', e.target.id);
        e.target.classList.add('dragging');
    }

    function handleDragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        
        // ja täällä se löytää sen mitä raahataa
        const draggingElement = document.querySelector('.dragging');
        let hoveringElement = e.target.closest('li');
        if (!hoveringElement) {
            hoveringElement = e.target.closest('ul').querySelector('li');
        }
        if (!hoveringElement) return;


        // tää kattoo kummal puolel tehtävää hiiri on nii tietää kummalle puolelle sit laitetaa se siirettävä
        const hoveringElementRect = hoveringElement.getBoundingClientRect();
        const mouseY = e.clientY;
        const middleY = hoveringElementRect.top + hoveringElementRect.height / 2;

        if (mouseY < middleY) {
            hoveringElement.classList.add('drag-over-top');
            hoveringElement.classList.remove('drag-over-bottom');
        } else {
            hoveringElement.classList.add('drag-over-bottom');
            hoveringElement.classList.remove('drag-over-top');
        }
    }

    // ja sit se raahattavan tehtävän "pudotus"
    function handleDrop(e) {
        e.preventDefault();
        const draggingElement = document.querySelector('.dragging');
        // kertoo että eipäs enää raahata
        draggingElement.classList.remove('dragging');

        const draggedId = e.dataTransfer.getData('text/plain');
        const draggedElement = document.getElementById(draggedId);
        let hoveringElement = e.target.closest('li');
        if (!hoveringElement) {
            hoveringElement = e.target.closest('ul').querySelector('li');
        }
        if (!hoveringElement) return;

        // ja nyt tiedetää mille puolelle se tehtävä laitetaa
        if (hoveringElement.classList.contains('drag-over-top')) {
            hoveringElement.before(draggedElement);
        } else {
            hoveringElement.after(draggedElement);
        }

        document.querySelectorAll('.drag-over-top, .drag-over-bottom').forEach(elem => {
            elem.classList.remove('drag-over-top', 'drag-over-bottom');
        });
    }

    // täs kikkaillaa sen kanssa mihin kohtaa hiiri haluu suhasta nii saa visuaalisen palauttee mihin tehtävä menis jos tiputtaa, paljon trial and errorii    
    function handleDragEnter(e) {
        e.preventDefault();
        const rect = e.target.getBoundingClientRect();
        const y = e.clientY - rect.top;
        e.target.classList.remove('drag-over-top', 'drag-over-bottom');
        if (y < rect.height / 2) {
            e.target.classList.add('drag-over-top');
        } else {
            e.target.classList.add('drag-over-bottom');
        }
    }

    function handleDragLeave(e) {
        e.target.classList.remove('drag-over-top', 'drag-over-bottom');
    }


    ////////////
    ////////////
    

    // lataa tehtävät local storagesta
    function loadTodos() {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.forEach(todo => {
            addTodoToList(todo);
        });
    }

    // tallentaa ne sinne
    function saveTodoToLocal(todo) {
        const todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos.push(todo);
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // ja päivittää sitä
    function updateLocalTodos() {
        const todos = Array.from(todoLista.children).map(li => {
            return {
                text: li.childNodes[0].nodeValue.trim(),
                completed: li.classList.contains('completed')
            };
        });
        localStorage.setItem('todos', JSON.stringify(todos));
    }

    // poistaa sieltä
    function removeTodoFromLocal(text) {
        let todos = JSON.parse(localStorage.getItem('todos')) || [];
        todos = todos.filter(todo => todo.text !== text);
        localStorage.setItem('todos', JSON.stringify(todos));
    }


});
