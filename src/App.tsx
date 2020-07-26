import React, { useState, KeyboardEvent, ChangeEvent } from 'react';
import './../node_modules/bulma/css/bulma.min.css';
import { Todo } from './todoType';
import {
  RecoilRoot,
  atom,
  selector,
  useRecoilState,
  useRecoilValue,
  useSetRecoilState,
} from 'recoil';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheckSquare } from '@fortawesome/free-solid-svg-icons';
import { faSquare } from '@fortawesome/free-regular-svg-icons';

const defaultTodoList: Todo[] = [
  {
    todo: 'Cook Supper',
    isDone: true,
  },
  {
    todo: 'Buy Bread',
    isDone: false,
  },
  {
    todo: 'Buy Milk',
    isDone: false,
  },
  {
    todo: 'Buy Flowers',
    isDone: false,
  },
];

const todoListState = atom<Todo[]>({
  key: 'todoListState',
  default: defaultTodoList,
});

const todoQueryState = atom({
  key: 'todoQueryState',
  default: '', // no query
});

const filteredTodosState = selector({
  key: 'searchedTodoState',
  get: ({ get }) => {
    const filter = get(todoQueryState);
    const todosList = get(todoListState);
    // return the whole list if query is not set
    if (filter === '') {
      return todosList;
    }
    // use the filter word to return only todos matches the query
    return todosList.filter((todo) => todo.todo.toLowerCase().includes(filter));
  },
});

export default function App() {
  return (
    <RecoilRoot>
      <AppShell />
    </RecoilRoot>
  );
}

function AppShell() {
  return (
    <>
      <TopBar />
      <section className="section">
        <div className="container">
          <div className="columns">
            <div className="column">
              <div className="columns is-multiline">
                <div className="column is-full">
                  <AddTodos />
                </div>
                <div className="column is-full">
                  <ListTodos />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

function TopBar() {
  return (
    <>
      <nav
        className="navbar is-dark"
        role="navigation"
        aria-label="main navigation"
      >
        <div className="container">
          <div className="navbar-menu">
            <div className="navbar-item column">
              <SearchBox />
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}

function SearchBox() {
  const setQuery = useSetRecoilState(todoQueryState);
  const query = useRecoilValue(todoQueryState);

  function onChange({ target: { value } }: ChangeEvent<HTMLInputElement>) {
    setQuery(() => value);
  }

  return (
    <>
      <div className="field is-fullwidth">
        <div className="control">
          <input
            className="input is-large is-rounded"
            type="text"
            placeholder="Search for todos"
            onChange={onChange}
            value={query}
          />
        </div>
      </div>
    </>
  );
}

function AddTodos() {
  const [todoInputValue, setTodoInputValue] = useState('');
  const [todoExistsErrorClass, setTodoExistsErrorClass] = useState('');
  const setTodoList = useSetRecoilState(todoListState);

  function addTodo({ key }: KeyboardEvent<HTMLInputElement>) {
    if (key === 'Enter') {
      const todo = { todo: todoInputValue, isDone: false };
      setTodoList((state) => {
        const alreadyExists = state.filter(
          (todo) => todo.todo.toLowerCase() === todoInputValue.toLowerCase()
        );
        if (alreadyExists.length > 0) {
          setTodoExistsErrorClass('is-danger');
          return state;
        }
        return [...state, todo];
      });
      setTodoInputValue('');
    }
  }

  function onChange({ target: { value } }: ChangeEvent<HTMLInputElement>) {
    setTodoInputValue(value);
    setTodoExistsErrorClass('');
  }

  return (
    <>
      <h2 className="subtitle is-3">Add Todo</h2>
      <div className="field">
        <div className="control">
          <input
            onKeyDown={addTodo}
            onChange={onChange}
            value={todoInputValue}
            className={`input is-large is-rounded ${todoExistsErrorClass}`}
            placeholder="Buy Bread, Buy Milk ..."
          />
        </div>
      </div>
    </>
  );
}

function ListTodos() {
  const todoList = useRecoilValue(filteredTodosState);
  const setTodoList = useSetRecoilState(todoListState);

  function toggleTodo(todo: Todo) {
    setTodoList((state) => {
      const todos = state.map((todoInState) => {
        if (todo.todo.toLowerCase() === todoInState.todo.toLowerCase()) {
          return {
            ...todoInState,
            isDone: !todoInState.isDone,
          };
        }
        return todoInState;
      });
      return [...todos];
    });
  }

  return (
    <>
      <h2 className="subtitle is-3">Your Todos</h2>
      <div className="list is-full is-hoverable">
        <div
          style={{
            cursor: 'pointer',
          }}
          className="list-item"
        >
          {todoList.map((todo) => (
            <TodoItem key={todo.todo} todo={todo} toggleTodo={toggleTodo} />
          ))}
        </div>
      </div>
    </>
  );
}

type TodoItemProps = {
  todo: Todo;
  toggleTodo: (todo: Todo) => void;
};

function TodoItem({ todo, toggleTodo }: TodoItemProps) {
  return (
    <>
      <div role="button" className="columns" onClick={() => toggleTodo(todo)}>
        <div className="column">
          <div className="content is-large">{todo.todo}</div>
        </div>
        <div className="column is-narrow">
          <div className="content is-large">
            {todo.isDone && <FontAwesomeIcon icon={faCheckSquare} />}
            {!todo.isDone && <FontAwesomeIcon icon={faSquare} />}
          </div>
        </div>
      </div>
    </>
  );
}
