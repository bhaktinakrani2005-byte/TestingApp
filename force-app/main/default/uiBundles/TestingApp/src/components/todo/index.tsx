import React from 'react'
import AddTodo from './AddTodo'
import TodoList from './todoList'

const TodoListMainPage = () => {
    return (
        <div className=' flex p-4 justify-center h-full flex-col items-center'>
            <div className='w-full container' >
                <AddTodo />
                <TodoList />
            </div>
        </div>

    )
}

export default TodoListMainPage