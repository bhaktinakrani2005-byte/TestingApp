import AddTodo from './AddTodo'
import TodoList from './TodoList'

const TodoListMainPage = () => {
    return (
        <div className=' flex p-4 justify-center h-full flex-col items-center'>
            <div className='w-full container space-y-8' >
                <AddTodo />
                <TodoList />
            </div>
        </div>

    )
}

export default TodoListMainPage