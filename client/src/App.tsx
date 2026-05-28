import { useEffect, useState } from 'react';
import { taskAPI, type Task } from './services/api.js';
import { AuthForm } from './components/AuthForm.jsx'; // Importamos el login
import { Sparkles, Plus, Trash2, CheckCircle2, Circle, ChevronDown, ChevronUp, LogOut, User } from 'lucide-react';

const COLUMNS = [
  { id: 'backlog', title: '🗄️ Backlog', bg: 'bg-slate-800/40' },
  { id: 'todo', title: '📋 Por Hacer', bg: 'bg-indigo-950/30' },
  { id: 'in_progress', title: '⚡ En Progreso', bg: 'bg-amber-950/20' },
  { id: 'done', title: '✅ Hecho', bg: 'bg-emerald-950/20' }
];

function App() {
  // --- ESTADOS DE AUTENTICACIÓN ---
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [currentUser, setCurrentUser] = useState<any>(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  // --- ESTADOS DEL KANBAN ---
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(false);
  const [collapsedTasks, setCollapsedTasks] = useState<Record<string, boolean>>({});
  
  // Estados del Formulario
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [status, setStatus] = useState<Task['status']>('todo');
  const [useAI, setUseAI] = useState(true);

  // Traer tareas si hay sesión activa
  const fetchTasks = async () => {
    if (!token) return;
    try {
      const data = await taskAPI.getAll();
      setTasks(data);
    } catch (error) {
      console.error("Error cargando tareas:", error);
      // Si el token expiró o tiró 401, deslogueamos al usuario por seguridad
      if ((error as any).response?.status === 401) {
        handleLogout();
      }
    }
  };

  useEffect(() => {
    fetchTasks();
  }, [token]);

  // Manejar el éxito del Login/Registro
  const handleAuthSuccess = (newToken: string, user: any) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(user));
    setToken(newToken);
    setCurrentUser(user);
  };

  // Manejar el Cierre de Sesión
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setCurrentUser(null);
    setTasks([]);
  };

  // Crear Tarea
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setLoading(true);
      await taskAPI.create({ title, description, priority, status, useAI });
      setTitle('');
      setDescription('');
      fetchTasks();
    } catch (error) {
      console.error("Error al crear tarea:", error);
    } finally {
      setLoading(false);
    }
  };

  // Alternar Checkbox de una Subtarea
  const handleToggleSubtask = async (task: Task, subtaskIndex: number) => {
    const updatedSubtasks = [...task.subtasks];
    updatedSubtasks[subtaskIndex].isCompleted = !updatedSubtasks[subtaskIndex].isCompleted;
    
    try {
      const updated = await taskAPI.update(task._id, { subtasks: updatedSubtasks });
      setTasks(tasks.map(t => t._id === task._id ? updated : t));
    } catch (error) {
      console.error(error);
    }
  };

  // Mover Tarea por Drag & Drop
  const handleDropTask = async (taskId: string, targetStatus: Task['status']) => {
    const taskToUpdate = tasks.find(t => t._id === taskId);
    if (!taskToUpdate || taskToUpdate.status === targetStatus) return;

    try {
      const updated = await taskAPI.update(taskId, { status: targetStatus });
      setTasks(tasks.map(t => t._id === taskId ? updated : t));
    } catch (error) {
      console.error("Error al mover la tarea:", error);
    }
  };

  // Eliminar Tarea
  const handleDeleteTask = async (id: string) => {
    try {
      await taskAPI.delete(id);
      setTasks(tasks.filter(t => t._id !== id));
    } catch (error) {
      console.error(error);
    }
  };

  // Alternar colapso de tarjeta (Acordeón)
  const toggleCollapse = (taskId: string) => {
    setCollapsedTasks(prev => ({
      ...prev,
      [taskId]: !prev[taskId]
    }));
  };

  // --- RENDERING CONDICIONAL DE AUTH ---
  if (!token) {
    return <AuthForm onAuthSuccess={handleAuthSuccess} />;
  }

  // --- RENDERING DEL TABLERO KANBAN REAL ---
  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6">
      {/* HEADER CON BOTÓN DE LOGOUT */}
      <header className="max-w-7xl mx-auto flex items-center justify-between border-b border-slate-800 pb-5 mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Sparkles className="w-6 h-6 text-amber-300 animate-pulse" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">AI-TaskMind</h1>
            <p className="text-xs text-slate-400">Tablero Kanban asistido por Agente de IA Local</p>
          </div>
        </div>

        {/* CONTROLES DE USUARIO LOGUEADO */}
        {currentUser && (
          <div className="flex items-center gap-4 bg-slate-800/50 border border-slate-700/50 px-4 py-2 rounded-xl">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <div className="w-6 h-6 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center">
                <User className="w-3.5 h-3.5" />
              </div>
              <span>{currentUser.name}</span>
            </div>
            <div className="w-px h-4 bg-slate-700" />
            <button
              onClick={handleLogout}
              className="text-xs text-slate-400 hover:text-red-400 transition-colors flex items-center gap-1.5 font-medium"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" /> Salir
            </button>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* PANEL DE CREACIÓN DE TAREA */}
        <section className="lg:col-span-1 bg-slate-800/80 border border-slate-700/60 p-5 rounded-2xl h-fit shadow-xl backdrop-blur-sm">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Plus className="w-5 h-5 text-indigo-400" /> Nueva Tarea
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Título</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Ej: Crear pantalla de perfil"
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Descripción</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detalles técnicos de la actividad..."
                className="w-full bg-slate-900/80 border border-slate-700 rounded-xl px-3 py-2 text-sm text-white h-20 resize-none focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Prioridad</label>
                <select
                  value={priority}
                  onChange={e => setPriority(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="low">🟢 Baja</option>
                  <option value="medium">🟡 Media</option>
                  <option value="high">🔴 Alta</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">Columna Inicial</label>
                <select
                  value={status}
                  onChange={e => setStatus(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-2 py-2 text-xs text-white focus:outline-none"
                >
                  <option value="backlog">Backlog</option>
                  <option value="todo">Por Hacer</option>
                  <option value="in_progress">En Progreso</option>
                </select>
              </div>
            </div>

            {/* CONTROL DE AGENTE IA */}
            <div className="bg-slate-900/60 p-3 rounded-xl border border-slate-700/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className={`w-4 h-4 ${useAI ? 'text-amber-400 animate-bounce' : 'text-slate-500'}`} />
                <span className="text-xs font-medium">Sugerir Subtareas (IA)</span>
              </div>
              <input
                type="checkbox"
                checked={useAI}
                onChange={e => setUseAI(e.target.checked)}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-700 border-slate-600"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-700 text-white font-medium py-2.5 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/10 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  🤖 Pensando subtareas...
                </>
              ) : (
                'Crear Actividad'
              )}
            </button>
          </form>
        </section>

        {/* COLUMNAS KANBAN */}
        <section className="lg:col-span-3 grid grid-cols-1 md:grid-cols-4 gap-4">
          {COLUMNS.map(col => {
            const colTasks = tasks.filter(t => t.status === col.id);
            return (
              <div 
                key={col.id} 
                onDragOver={(e) => e.preventDefault()}
                onDrop={(e) => {
                  const taskId = e.dataTransfer.getData("text/plain");
                  handleDropTask(taskId, col.id as any);
                }}
                className={`rounded-2xl p-3 ${col.bg} border border-slate-800/60 flex flex-col min-h-[500px] transition-colors duration-200`}
              >
                <div className="flex items-center justify-between mb-3 px-1">
                  <h3 className="font-semibold text-sm text-slate-300">{col.title}</h3>
                  <span className="bg-slate-800 px-2 py-0.5 rounded-full text-xs text-slate-400 font-bold">
                    {colTasks.length}
                  </span>
                </div>

                {/* CONTENEDOR DE TARJETAS */}
                <div className="space-y-3 flex-1 overflow-y-auto min-h-[400px]">
                  {colTasks.map(task => {
                    const isCollapsed = collapsedTasks[task._id] || false;

                    return (
                      <div 
                        key={task._id} 
                        draggable
                        onDragStart={(e) => {
                          e.dataTransfer.setData("text/plain", task._id);
                          e.dataTransfer.effectAllowed = "move";
                        }}
                        className="bg-slate-800 border border-slate-700/50 p-3 rounded-xl shadow-md space-y-2 group transition-all hover:border-slate-600 cursor-grab active:cursor-grabbing"
                      >
                        
                        {/* TOP DE LA TARJETA */}
                        <div className="flex items-center justify-between gap-2">
                          <span className={`text-xs px-2 py-0.5 rounded-md font-bold uppercase tracking-wider ${
                            task.priority === 'high' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                            task.priority === 'medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-emerald-500/10 text-emerald-400 border border-slate-700/50'
                          }`}>
                            {task.priority}
                          </span>
                          
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => toggleCollapse(task._id)}
                              className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                              title={isCollapsed ? "Expandir tarea" : "Contraer tarea"}
                            >
                              {isCollapsed ? <ChevronDown className="w-4 h-4" /> : <ChevronUp className="w-4 h-4" />}
                            </button>

                            <button 
                              onClick={() => handleDeleteTask(task._id)}
                              className="text-slate-500 hover:text-red-400 p-1 rounded transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* TÍTULO */}
                        <div>
                          <h4 className="font-semibold text-sm text-white leading-snug">{task.title}</h4>
                        </div>

                        {/* CONTENIDO CONDICIONAL (ACORDEÓN) */}
                        {!isCollapsed && (
                          <div className="space-y-2 pt-1">
                            {task.description && (
                              <p className="text-xs text-slate-400 line-clamp-2">{task.description}</p>
                            )}

                            {/* SUBTAREAS DE LA IA */}
                            {task.subtasks.length > 0 && (
                              <div className="pt-2 border-t border-slate-700/50 space-y-1" onClick={(e) => e.stopPropagation()}>
                                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 flex items-center gap-1">
                                  <Sparkles className="w-2.5 h-2.5 text-amber-400" /> Subtareas IA:
                                </p>
                                {task.subtasks.map((sub, idx) => (
                                  <div 
                                    key={sub._id || idx} 
                                    onClick={() => handleToggleSubtask(task, idx)}
                                    className="flex items-center gap-2 cursor-pointer p-1 rounded hover:bg-slate-700/40 select-none text-xs"
                                  >
                                    {sub.isCompleted ? (
                                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                    ) : (
                                      <Circle className="w-3.5 h-3.5 text-slate-500 flex-shrink-0" />
                                    )}
                                    <span className={`line-clamp-2 ${sub.isCompleted ? 'line-through text-slate-500' : 'text-slate-300'}`}>
                                      {sub.title}
                                    </span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* TEXTO DE CONTROL DE DRAG */}
                            <div className="text-[10px] text-slate-500 text-center pt-1 border-t border-slate-700/30 font-medium">
                              👋 Arrastrá para mover de columna
                            </div>
                          </div>
                        )}

                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </section>
      </main>
    </div>
  );
}

export default App;