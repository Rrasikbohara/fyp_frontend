import React, { useState, useEffect, useRef } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import { HiTrash, HiPlay, HiSearch } from 'react-icons/hi';
import 'react-toastify/dist/ReactToastify.css';
import 'tailwindcss/tailwind.css';
import alarmSound from '../../assets/alram.mp3';

// Exercise database with photos and instructions
const exercisesDatabase = [
  // Strength - Upper Body
  {
    id: 1,
    name: 'Push Ups',
    category: 'Upper Body',
    bodyPart: 'Chest, Shoulders, Triceps',
    image: 'https://media1.popsugar-assets.com/files/thumbor/3mHOo40hZnyZ0JSCMzqq0G8vO3g/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2017/03/22/738/n/1922729/8589c22c445d63e2_0e7e9800cb65fd44_Tricep-Push-Up.jpg',
    instructions: '1. Begin in plank position with hands shoulder-width apart.\n2. Keep your body in a straight line from head to toe.\n3. Lower your body until your chest nearly touches the floor.\n4. Push yourself back up to the starting position.\n5. Repeat for desired reps.'
  },
  {
    id: 2,
    name: 'Dumbbell Rows',
    category: 'Upper Body',
    bodyPart: 'Back',
    image: 'https://th.bing.com/th?id=OIF.itIhjFkl8o%2bzviPm2wTG6Q&rs=1&pid=ImgDetMain',
    instructions: '1. Place your right knee and hand on a bench.\n2. Hold a dumbbell in your left hand with arm extended.\n3. Pull the dumbbell up to your side, keeping elbow close to body.\n4. Lower back down with control.\n5. Complete reps, then switch sides.'
  },
  {
    id: 3,
    name: 'Shoulder Press',
    category: 'Upper Body',
    bodyPart: 'Shoulders',
    image: 'https://th.bing.com/th?id=OIF.OceHGq89kL%2bGcNssB6AwDw&rs=1&pid=ImgDetMain',
    instructions: '1. Sit on a bench with back support.\n2. Hold dumbbells at shoulder height with palms facing forward.\n3. Press the weights overhead until arms are fully extended.\n4. Slowly lower back to starting position.\n5. Maintain core engagement throughout.'
  },
  {
    id: 4,
    name: 'Tricep Dips',
    category: 'Upper Body',
    bodyPart: 'Triceps',
    image: 'https://res.cloudinary.com/hydrow/image/upload/f_auto/w_2048/q_100/v1747659611/Blog/triceps-exercises.jpg',
    instructions: '1. Sit on the edge of a bench or chair.\n2. Place hands beside hips, fingers pointing forward.\n3. Slide hips off bench, supporting weight with arms.\n4. Lower body by bending elbows until arms form 90° angle.\n5. Push back up to starting position.'
  },
  {
    id: 5,
    name: 'Bicep Curls',
    category: 'Upper Body',
    bodyPart: 'Biceps',
    image: 'https://i.pinimg.com/originals/81/12/b9/8112b9d9756f049b573665f6c8aefdf4.jpg',
    instructions: '1. Stand holding dumbbells with arms extended, palms forward.\n2. Keep elbows close to sides.\n3. Curl weights toward shoulders by bending elbows.\n4. Squeeze biceps at the top.\n5. Lower with control to starting position.'
  },
  
  // Lower Body
  {
    id: 6,
    name: 'Squats',
    category: 'Lower Body',
    bodyPart: 'Quadriceps, Glutes',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/bodyweight-squat.png',
    instructions: '1. Stand with feet shoulder-width apart.\n2. Extend arms in front for balance.\n3. Bend knees and push hips back as if sitting in a chair.\n4. Keep chest up and back straight.\n5. Lower until thighs are parallel to ground, then return to start position.'
  },
  {
    id: 7,
    name: 'Lunges',
    category: 'Lower Body',
    bodyPart: 'Quadriceps, Hamstrings, Glutes',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/10/walking-lunge.jpg',
    instructions: '1. Stand with feet hip-width apart.\n2. Step forward with one leg.\n3. Lower your body until both knees form 90-degree angles.\n4. Push through front foot to return to starting position.\n5. Repeat with other leg.'
  },
  {
    id: 8,
    name: 'Glute Bridges',
    category: 'Lower Body',
    bodyPart: 'Glutes, Lower Back',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/glute-bridge.png',
    instructions: '1. Lie on your back with knees bent, feet flat on floor.\n2. Keep arms at sides, palms down.\n3. Push through heels to lift hips off ground until body forms straight line from shoulders to knees.\n4. Squeeze glutes at the top.\n5. Lower hips back to floor with control.'
  },
  {
    id: 9,
    name: 'Calf Raises',
    category: 'Lower Body',
    bodyPart: 'Calves',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/standing-calf-raise-with-barbell.png',
    instructions: '1. Stand with feet hip-width apart.\n2. Rise onto the balls of your feet, lifting heels off the ground.\n3. Pause briefly at the top.\n4. Lower heels back to the ground with control.\n5. Repeat for desired repetitions.'
  },
  {
    id: 10,
    name: 'Romanian Deadlift',
    category: 'Lower Body',
    bodyPart: 'Hamstrings, Lower Back',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/06/romanian-deadlift-movement.png',
    instructions: '1. Stand holding dumbbells in front of thighs.\n2. Hinge at hips, pushing butt backward.\n3. Lower weights while keeping back flat.\n4. Lower until you feel hamstring stretch.\n5. Drive hips forward to return to standing.'
  },
  
  // Core Exercises
  {
    id: 11,
    name: 'Plank',
    category: 'Core',
    bodyPart: 'Abs, Back',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/11/standard-plank.jpg',
    instructions: '1. Start in push-up position but with forearms on the ground.\n2. Keep elbows directly under shoulders.\n3. Maintain a straight line from head to heels.\n4. Engage core and hold the position.\n5. Breathe normally and hold for desired time.'
  },
  {
    id: 12,
    name: 'Crunches',
    category: 'Core',
    bodyPart: 'Abs',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/08/crunches.jpg',
    instructions: '1. Lie on your back with knees bent.\n2. Place hands behind head or across chest.\n3. Lift shoulders off the ground using abdominal muscles.\n4. Keep lower back pressed into the floor.\n5. Slowly return to starting position and repeat.'
  },
  {
    id: 13,
    name: 'Russian Twists',
    category: 'Core',
    bodyPart: 'Obliques',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/11/russian-twists.jpg',
    instructions: '1. Sit on the floor with knees bent.\n2. Lean back slightly, keeping back straight.\n3. Lift feet slightly off the ground (or keep them down for easier version).\n4. Twist torso from side to side, touching the ground beside your hips.\n5. For added difficulty, hold a weight with both hands.'
  },
  {
    id: 14,
    name: 'Mountain Climbers',
    category: 'Core',
    bodyPart: 'Abs, Shoulders',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/04/mountain-climber-exercise.jpg',
    instructions: '1. Start in a push-up position with arms straight.\n2. Bring right knee toward chest.\n3. Quickly switch legs, bringing left knee forward while extending right leg back.\n4. Continue alternating legs in a running motion.\n5. Keep hips low and core engaged.'
  },
  {
    id: 15,
    name: 'Leg Raises',
    category: 'Core',
    bodyPart: 'Lower Abs',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/06/lying-leg-raises.jpg',
    instructions: '1. Lie flat on your back with legs straight.\n2. Place hands at sides or under lower back for support.\n3. Keeping legs straight, lift them until perpendicular to the floor.\n4. Slowly lower legs back down without touching floor.\n5. Repeat while keeping lower back pressed into floor.'
  },
  
  // Cardio Exercises
  {
    id: 16,
    name: 'Jumping Jacks',
    category: 'Cardio',
    bodyPart: 'Full Body',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/03/jumping-jacks.jpg',
    instructions: '1. Stand with feet together and arms at sides.\n2. Jump while spreading legs and raising arms overhead.\n3. Jump again to return to starting position.\n4. Repeat at a quick, controlled pace.\n5. Keep core engaged throughout movement.'
  },
  {
    id: 17,
    name: 'High Knees',
    category: 'Cardio',
    bodyPart: 'Lower Body, Core',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/10/high-knees-1000x1000.jpg',
    instructions: '1. Stand with feet hip-width apart.\n2. Run in place, bringing knees up to waist level.\n3. Pump arms in a running motion.\n4. Land on balls of feet.\n5. Maintain upright posture and perform at a quick pace.'
  },
  {
    id: 18,
    name: 'Burpees',
    category: 'Cardio',
    bodyPart: 'Full Body',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/08/how-to-do-burpees.jpg',
    instructions: '1. Start standing, then squat down and place hands on floor.\n2. Jump feet back into plank position.\n3. Perform a push-up (optional).\n4. Jump feet back toward hands.\n5. Explosively jump up with arms overhead.'
  },
  {
    id: 19,
    name: 'Jump Squats',
    category: 'Cardio',
    bodyPart: 'Lower Body',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2021/08/jump-squat-movement.jpg',
    instructions: '1. Stand with feet shoulder-width apart.\n2. Perform a regular squat.\n3. At the bottom of the squat, push through heels to jump explosively.\n4. Land softly by bending knees.\n5. Immediately lower into next squat.'
  },
  {
    id: 20,
    name: 'Jump Rope',
    category: 'Cardio',
    bodyPart: 'Full Body',
    image: 'https://www.inspireusafoundation.org/wp-content/uploads/2022/04/how-to-jump-rope.png',
    instructions: '1. Hold jump rope handles, rope behind your body.\n2. Swing rope overhead and jump over it as it passes under feet.\n3. Keep jumps small and controlled.\n4. Land softly on balls of feet.\n5. Maintain a consistent rhythm.'
  }
];

const Exercices = () => {
  const [exercise, setExercise] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [timer, setTimer] = useState(0);
  const [currentDuration, setCurrentDuration] = useState(0);
  const [running, setRunning] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [direction, setDirection] = useState(''); // Custom instructions
  
  const intervalRef = useRef(null);
  const audioRef = useRef(null);

  // Load history from localStorage on mount
  useEffect(() => {
    const storedHistory = localStorage.getItem('exerciseHistory');
    if (storedHistory) {
      setExerciseHistory(JSON.parse(storedHistory));
    }
  }, []);

  // Persist history changes
  useEffect(() => {
    localStorage.setItem('exerciseHistory', JSON.stringify(exerciseHistory));
  }, [exerciseHistory]);

  // Handle search for exercises
  useEffect(() => {
    if (searchQuery) {
      const filteredExercises = exercisesDatabase.filter(ex => 
        ex.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ex.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setSearchResults(filteredExercises);
    } else {
      setSearchResults([]);
    }
  }, [searchQuery]);

  const selectExerciseFromDatabase = (exerciseItem) => {
    setExercise(exerciseItem.name);
    setDirection(exerciseItem.instructions);
    setSelectedExercise(exerciseItem);
    setSearchQuery('');
    setSearchResults([]);
  };

  const startTimer = (duration) => {
    setCurrentDuration(duration);
    setTimer(duration);
    setRunning(true);
    intervalRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current);
          setRunning(false);
          if (audioRef.current) {
            audioRef.current.play();
            setTimeout(() => {
              audioRef.current.pause();
              audioRef.current.currentTime = 0;
            }, 3000);
          }
          toast.success("Exercise complete!");
          
          const historyEntry = {
            id: Date.now(),
            name: exercise,
            duration: duration,
            direction: direction
          };
          
          // If selected from database, add image too
          if (selectedExercise && selectedExercise.image) {
            historyEntry.image = selectedExercise.image;
          }
          
          setExerciseHistory(prev => [...prev, historyEntry]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const stopTimer = () => {
    clearInterval(intervalRef.current);
    setRunning(false);
  };

  const runExercise = (record) => {
    setExercise(record.name);
    setDirection(record.direction || '');
    if (record.image) {
      setSelectedExercise({ ...record });
    } else {
      setSelectedExercise(null);
    }
    startTimer(record.duration);
  };

  const deleteExercise = (id) => {
    setExerciseHistory(prev => prev.filter(record => record.id !== id));
  };

  useEffect(() => {
    return () => clearInterval(intervalRef.current);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-100 to-white p-8">
      <ToastContainer />
      <div className="max-w-5xl mx-auto space-y-8">
        <h1 className="text-5xl font-bold text-center text-blue-900">Exercise Dashboard</h1>
        
        <div className="bg-white shadow-lg rounded-xl p-6">
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            <div className="flex-1">
              <label className="block text-xl font-medium text-gray-700 mb-3">
                Enter Exercise Name or Search
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for exercises..."
                  className="w-full p-3 border rounded-lg pl-10 focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
                <HiSearch className="absolute top-3.5 left-3 text-gray-400 text-lg" />
              </div>
            </div>
            
            {!selectedExercise && (
              <div className="flex-1">
                <label className="block text-xl font-medium text-gray-700 mb-3">
                  Or enter custom exercise
                </label>
                <input
                  type="text"
                  value={exercise}
                  onChange={(e) => setExercise(e.target.value)}
                  placeholder="e.g., Push Ups"
                  className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            )}
          </div>
          
          {/* Search results */}
          {searchResults.length > 0 && (
            <div className="mt-4 border rounded-lg max-h-80 overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 p-4">
                {searchResults.map((ex) => (
                  <div 
                    key={ex.id} 
                    className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer bg-white"
                    onClick={() => selectExerciseFromDatabase(ex)}
                  >
                    <div className="h-40 overflow-hidden bg-gray-200">
                      {ex.image && (
                        <img 
                          src={ex.image} 
                          alt={ex.name} 
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.target.onerror = null; 
                            e.target.src = 'https://via.placeholder.com/400x300?text=Exercise+Image+Not+Available';
                          }} 
                        />
                      )}
                    </div>
                    <div className="p-3">
                      <div className="font-medium text-gray-800">{ex.name}</div>
                      <div className="flex flex-wrap gap-1 mt-1">
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{ex.category}</span>
                        {ex.bodyPart && (
                          <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{ex.bodyPart}</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {/* Browse by category - New section */}
          {!searchQuery && !selectedExercise && (
            <div className="mt-6">
              <h3 className="text-xl font-semibold text-gray-700 mb-3">Browse by Category</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                {['Upper Body', 'Lower Body', 'Core', 'Cardio'].map((category) => (
                  <button
                    key={category}
                    onClick={() => setSearchQuery(category)}
                    className="p-4 bg-gradient-to-br from-blue-50 to-indigo-100 rounded-lg text-center hover:from-blue-100 hover:to-indigo-200 transition-colors"
                  >
                    <span className="font-medium text-gray-800">{category}</span>
                    <div className="text-xs text-gray-600 mt-1">
                      {exercisesDatabase.filter(ex => ex.category === category).length} exercises
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {exercise && !selectedExercise && (
            <div className="mt-4">
              <label className="block text-lg font-medium text-gray-700 mb-2">
                Add Your Exercise Directions (optional)
              </label>
              <textarea
                value={direction}
                onChange={(e) => setDirection(e.target.value)}
                placeholder="e.g., Keep your back straight and lower slowly..."
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
                rows="3"
              />
            </div>
          )}
        </div>
        
        {(exercise || selectedExercise) && (
          <div className="bg-white shadow-xl rounded-xl p-6">
            <div className="mb-6 border-b pb-4 flex flex-col md:flex-row justify-between items-center">
              <div>
                <h2 className="text-3xl font-semibold text-gray-800">{exercise}</h2>
                {selectedExercise && selectedExercise.bodyPart && (
                  <div className="flex items-center mt-2">
                    <span className="text-sm bg-green-100 text-green-800 px-2 py-1 rounded-full">
                      {selectedExercise.bodyPart}
                    </span>
                  </div>
                )}
                <p className="text-gray-500 mt-1">Focus & maintain proper form during your exercise.</p>
              </div>
              <div className="mt-4 md:mt-0 flex items-center gap-4">
                <label className="text-lg font-medium text-gray-700">Duration (sec):</label>
                <input
                  type="number"
                  value={timer}
                  onChange={(e) => setTimer(Number(e.target.value))}
                  className="w-28 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
                  disabled={running}
                />
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row gap-6 mb-6">
              {/* Exercise image - Fixed display */}
              <div className="md:w-1/2">
                <div className="rounded-lg overflow-hidden shadow-md bg-gray-100 aspect-video">
                  {selectedExercise && selectedExercise.image ? (
                    <img 
                      src={selectedExercise.image} 
                      alt={selectedExercise.name}
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = 'https://via.placeholder.com/400x300?text=Exercise+Image+Not+Available';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <p className="text-xl text-gray-600 p-4 text-center">No image available for this exercise</p>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Exercise Instructions */}
              <div className="md:w-1/2">
                <h3 className="text-xl font-semibold mb-3">Instructions</h3>
                <div className="bg-gray-50 p-4 rounded-lg shadow-inner">
                  {direction ? (
                    <div className="whitespace-pre-line">{direction}</div>
                  ) : (
                    <p className="text-gray-500 italic">No instructions provided for this exercise.</p>
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <button 
                  onClick={() => startTimer(timer)}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 disabled:opacity-50"
                  disabled={running || timer <= 0}
                >
                  {running ? 'Running...' : 'Start Timer'}
                </button>
                <button 
                  onClick={stopTimer}
                  className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 disabled:opacity-50"
                  disabled={!running}
                >
                  Stop Timer
                </button>
              </div>
              {running && (
                <div className="text-2xl font-bold text-blue-600">
                  Time Remaining: {timer} sec
                </div>
              )}
            </div>
          </div>
        )}
        
        {/* Previous exercises section - Improved display */}
        {exerciseHistory.length > 0 && (
          <div className="bg-white shadow-xl rounded-xl p-6">
            <h3 className="text-3xl font-semibold text-gray-800 mb-4">Previous Exercises</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {exerciseHistory.map(record => (
                <div key={record.id} className="border rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row">
                    {record.image ? (
                      <div className="sm:w-1/3">
                        <div className="h-32 sm:h-full bg-gray-100">
                          <img 
                            src={record.image} 
                            alt={record.name}
                            className="w-full h-full object-cover" 
                            onError={(e) => {
                              e.target.onerror = null; 
                              e.target.src = 'https://via.placeholder.com/300x200?text=No+Image';
                            }}
                          />
                        </div>
                      </div>
                    ) : null}
                    
                    <div className={`p-4 ${record.image ? 'sm:w-2/3' : 'w-full'}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="text-xl font-medium text-gray-700">{record.name}</div>
                          <div className="text-gray-500">Duration: {record.duration} sec</div>
                          {record.direction && (
                            <div className="mt-2 text-gray-600 line-clamp-2 text-sm">
                              <span className="font-medium">Instructions:</span> {record.direction.substring(0, 60)}...
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => runExercise(record)} 
                            className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50"
                            title="Run this exercise again"
                          >
                            <HiPlay className="w-6 h-6" />
                          </button>
                          <button 
                            onClick={() => deleteExercise(record.id)} 
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                            title="Delete this exercise"
                          >
                            <HiTrash className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        <audio ref={audioRef} src={alarmSound} preload="auto" />
      </div>
    </div>
  );
};

export default Exercices;
