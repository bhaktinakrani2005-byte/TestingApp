import AddTodo from './AddTodo'
import TodoList from './TodoList'
import UpdateTodo from './UpdateTodo'

const TodoListMainPage = () => {
    return (
        <div className=' flex p-4 justify-center h-full flex-col items-center'>
            <div className='w-full container' >
                <AddTodo />
                <TodoList />
                <UpdateTodo />
            </div>
        </div>

    )
}

export default TodoListMainPage