// Schedule.jsx
import React, { useState, useEffect, useRef } from "react";
import { toast } from "react-toastify";
import { useOutletContext } from "react-router-dom";
import "react-toastify/dist/ReactToastify.css";
import alarmSound from "../../assets/alram.mp3";
import { api } from "../../services/api";
import { HiOutlinePencil, HiOutlineTrash, HiOutlineExclamationCircle, HiCheckCircle } from "react-icons/hi";

const Schedule = () => {
  const { scheduledWorkouts = [], setScheduledWorkouts = () => {} } = useOutletContext() || {};
  const [activeWorkout, setActiveWorkout] = useState(null);
  const [timer, setTimer] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isAlarmPlaying, setIsAlarmPlaying] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    day: "Sunday",
    time: "00:00",
    duration: 30,
    exercise: "",
  });

  const alarmRef = useRef(new Audio(alarmSound));
  const timerRef = useRef(null);

  // Weekly routine configuration
  const [weeklyPlan, setWeeklyPlan] = useState({
    enabled: false,
    reminderTime: "06:00", // Default reminder time
    weekPlan: {
      "Sunday": "Biceps",
      "Monday": "Triceps",
      "Tuesday": "Chest",
      "Wednesday": "Back",
      "Thursday": "Shoulders",
      "Friday": "Legs",
      "Saturday": "Rest Day",
    },
  });

  // Load weekly plan from localStorage
  useEffect(() => {
    const savedPlan = localStorage.getItem("weeklyRoutine");
    if (savedPlan) {
      setWeeklyPlan(JSON.parse(savedPlan));
    }
  }, []);

  // Save weekly plan whenever it changes
  useEffect(() => {
    localStorage.setItem("weeklyRoutine", JSON.stringify(weeklyPlan));
  }, [weeklyPlan]);

  // Check for daily reminders according to weekly plan
  useEffect(() => {
    if (!weeklyPlan.enabled) return;

    const checkRoutineInterval = setInterval(() => {
      const now = new Date();
      const currentDay = now.toLocaleString("en-US", { weekday: "long" });
      const currentTime = now.toLocaleTimeString("en-US", {
        hour12: false,
        hour: "2-digit",
        minute: "2-digit",
      });

      // If it's the reminder time and there's a workout scheduled for today (not Rest Day)
      if (
        currentTime === weeklyPlan.reminderTime &&
        weeklyPlan.weekPlan[currentDay] &&
        weeklyPlan.weekPlan[currentDay] !== "Rest Day"
      ) {
        // Use workout for today from weekly plan
        const todaysWorkout = weeklyPlan.weekPlan[currentDay];

        // Create a workout reminder
        const reminderWorkout = {
          id: `weekly_${currentDay}_${Date.now()}`,
          day: currentDay,
          time: weeklyPlan.reminderTime,
          exercise: todaysWorkout,
          duration: 60, // Default duration
          isWeeklyRoutine: true,
        };

        // Check if we already reminded for this day
        const today = new Date().toLocaleDateString();
        const alreadyReminded = localStorage.getItem(`reminded_${currentDay}_${today}`);

        if (!alreadyReminded) {
          // Play alarm sound
          alarmRef.current.play();
          setIsAlarmPlaying(true);

          // Show workout reminder
          setActiveWorkout(reminderWorkout);
          setTimer(reminderWorkout.duration * 60);

          // Mark as reminded for today
          localStorage.setItem(`reminded_${currentDay}_${today}`, "true");

          // Show toast
          toast.info(`Time for your ${todaysWorkout} workout!`, {
            position: "bottom-right",
            autoClose: false,
          });
        }
      }
    }, 30000); // Check every 30 seconds to not miss the exact time

    return () => clearInterval(checkRoutineInterval);
  }, [weeklyPlan]);

  // Timer controls
  const startTimer = () => {
    setIsTimerRunning(true);
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          setIsTimerRunning(false);
          alarmRef.current.play();
          setIsAlarmPlaying(true);
          toast.success("Workout completed successfully! 🎉", {
            position: "bottom-right",
            autoClose: 5000,
          });
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const pauseTimer = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
  };

  const cancelWorkout = () => {
    clearInterval(timerRef.current);
    setIsTimerRunning(false);
    setTimer(0);
    setActiveWorkout(null);
    stopAlarm();
  };

  const stopAlarm = () => {
    alarmRef.current.pause();
    alarmRef.current.currentTime = 0;
    setIsAlarmPlaying(false);
  };

  // Handler to toggle weekly plan
  const toggleWeeklyPlan = () => {
    setWeeklyPlan((prev) => ({
      ...prev,
      enabled: !prev.enabled,
    }));

    if (!weeklyPlan.enabled) {
      toast.success("Weekly workout routine enabled!");
    } else {
      toast.info("Weekly workout routine disabled");
    }
  };

  // Handler to update weekly plan exercise for a day
  const updateWeeklyPlanExercise = (day, exercise) => {
    setWeeklyPlan((prev) => ({
      ...prev,
      weekPlan: {
        ...prev.weekPlan,
        [day]: exercise,
      },
    }));
  };

  const handleDayChange = (day) => {
    setNewWorkout({
      ...newWorkout,
      day: day,
    });
  };

  const addWorkoutSchedule = async () => {
    if (newWorkout.duration < 1) {
      toast.error("Duration must be at least 1 minute");
      return;
    }
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please sign in.");
        return;
      }

      const workoutToAdd = {
        ...newWorkout,
      };

      const res = await api.post("/schedule", workoutToAdd, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const newWorkoutWithId = {
        ...res.data,
        id: res.data._id || `temp_${Date.now()}`,
      };

      setScheduledWorkouts((prev) => [newWorkoutWithId, ...prev]);

      setNewWorkout({
        day: "Sunday",
        time: "00:00",
        duration: 30,
        exercise: "",
      });
      toast.success("Workout scheduled successfully!");
    } catch (error) {
      console.error("Error adding schedule:", error.response?.data || error.message);

      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please sign in again.");
      } else {
        toast.error(error.response?.data?.message || "Failed to add schedule");
      }
    }
  };

  const removeWorkout = async (id) => {
    try {
      if (!id) {
        console.error("Cannot remove workout: ID is undefined");
        toast.error("Invalid workout ID");
        return;
      }

      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authentication required. Please sign in.");
        return;
      }

      if (id && !id.toString().startsWith("temp_")) {
        await api.delete(`/schedule/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }

      setScheduledWorkouts((prev) => prev.filter((w) => w.id !== id && w._id !== id));
      toast.success("Workout schedule removed");
    } catch (error) {
      console.error("Error removing workout:", error);
      toast.error("Failed to remove workout");
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 py-10">
      {/* Header Section */}
      <div className="flex items-center justify-between p-4 bg-white rounded-xl shadow-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Weekly Workout Plan
        </h1>
        <div className="flex items-center space-x-4">
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={weeklyPlan.enabled}
              onChange={toggleWeeklyPlan}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span className="ml-3 text-sm font-medium text-gray-900">
              {weeklyPlan.enabled ? "Enabled" : "Disabled"}
            </span>
          </label>
        </div>
      </div>

      {/* Weekly Plan Configuration */}
      <div className="bg-white p-6 rounded-xl shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-800">Weekly Workout Schedule</h2>
          <div className="flex items-center space-x-2">
            <span className="text-gray-600">Daily reminder at</span>
            <input
              type="time"
              value={weeklyPlan.reminderTime}
              onChange={(e) =>
                setWeeklyPlan((prev) => ({
                  ...prev,
                  reminderTime: e.target.value,
                }))
              }
              className="px-3 py-1 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400"
            />
          </div>
        </div>

        <div className="grid grid-cols-7 gap-2">
          {Object.entries(weeklyPlan.weekPlan).map(([day, exercise], index) => (
            <div
              key={day}
              className={`p-3 rounded-lg ${
                day === "Saturday" ? "bg-gray-50" : "bg-blue-50"
              } ${weeklyPlan.enabled ? "border-2 border-blue-200" : ""}`}
            >
              <div className="font-medium text-gray-800">{day}</div>
              <div className="mt-2">
                <select
                  value={exercise}
                  onChange={(e) => updateWeeklyPlanExercise(day, e.target.value)}
                  className="w-full p-2 text-sm border rounded focus:ring-2 focus:ring-blue-400"
                  disabled={day === "Saturday"} // Make Saturday locked as Rest Day
                >
                  <option value="Rest Day">Rest Day</option>
                  <option value="Biceps">Biceps</option>
                  <option value="Triceps">Triceps</option>
                  <option value="Chest">Chest</option>
                  <option value="Back">Back</option>
                  <option value="Shoulders">Shoulders</option>
                  <option value="Legs">Legs</option>
                  <option value="Cardio">Cardio</option>
                  <option value="Full Body">Full Body</option>
                  <option value="Core">Core</option>
                </select>
              </div>
              {/* Indicator for today */}
              {new Date().toLocaleString("en-US", { weekday: "long" }) === day && (
                <div className="mt-2 bg-blue-100 p-1 rounded text-xs font-medium text-center text-blue-800">
                  TODAY
                </div>
              )}
            </div>
          ))}
        </div>

        {weeklyPlan.enabled ? (
          <div className="bg-green-50 p-3 rounded-lg flex items-start">
            <HiCheckCircle className="text-green-500 text-xl flex-shrink-0 mt-1" />
            <div className="ml-3">
              <p className="text-green-800 font-medium">Weekly routine is active</p>
              <p className="text-sm text-green-700">
                You'll get workout reminders at {weeklyPlan.reminderTime} every day according to your schedule.
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-yellow-50 p-3 rounded-lg flex items-start">
            <HiOutlineExclamationCircle className="text-yellow-500 text-xl flex-shrink-0 mt-1" />
            <div className="ml-3">
              <p className="text-yellow-800 font-medium">Weekly routine is paused</p>
              <p className="text-sm text-yellow-700">
                Enable the toggle above to get automatic daily reminders.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Active Workout Section */}
      {activeWorkout && (
        <div className="bg-white p-6 rounded-xl shadow-sm space-y-4 border-2 border-blue-100">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold text-blue-600">Active Workout</h3>
              <p className="text-gray-600">
                {activeWorkout.exercise} - {activeWorkout.duration} minutes
              </p>
              {activeWorkout.isWeeklyRoutine && (
                <span className="inline-block mt-1 px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                  Daily Routine
                </span>
              )}
            </div>
            <div className="flex space-x-2">
              {isAlarmPlaying && (
                <button
                  onClick={stopAlarm}
                  className="p-2 bg-blue-100 hover:bg-blue-200 text-blue-600 rounded-lg transition-colors"
                  title="Mute alarm"
                >
                  🔕
                </button>
              )}
            </div>
          </div>

          <div className="text-center space-y-4">
            <div className="text-4xl font-mono font-bold text-blue-600">{formatTime(timer)}</div>
            <div className="flex justify-center space-x-3">
              {!isTimerRunning ? (
                <button
                  onClick={startTimer}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-all"
                >
                  ▶ Start
                </button>
              ) : (
                <button
                  onClick={pauseTimer}
                  className="px-6 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg transition-all"
                >
                  ⏸ Pause
                </button>
              )}
              <button
                onClick={cancelWorkout}
                className="px-6 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
              >
                ⏹ Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* One-Time Scheduled Workouts Section */}
      {scheduledWorkouts.length > 0 && (
        <div className="bg-white p-6 rounded-xl shadow-sm">
          <h3 className="text-xl font-bold mb-4 text-gray-800">One-Time Scheduled Workouts</h3>
          <div className="space-y-3">
            {scheduledWorkouts.map((workout) => (
              <div
                key={workout.id || workout._id}
                className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-semibold text-blue-600">{workout.day}</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{workout.time}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-1 bg-green-100 text-green-600 rounded-full text-sm">
                      {workout.exercise}
                    </span>
                    <span className="text-sm text-gray-500">{workout.duration} minutes</span>
                  </div>
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => removeWorkout(workout.id || workout._id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete workout"
                  >
                    <HiOutlineTrash className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recommended Exercises Based on Weekly Plan */}
      <div className="bg-white p-6 rounded-xl shadow-sm">
        <h3 className="text-xl font-bold mb-2 text-gray-800">Weekly Workout Recommendations</h3>
        <p className="text-gray-600 mb-4">Based on your weekly plan</p>

        <div className="space-y-3">
          {Object.entries(weeklyPlan.weekPlan).map(([day, exercise]) => {
            const isToday = new Date().toLocaleString("en-US", { weekday: "long" }) === day;

            return (
              <div
                key={day}
                className={`p-4 rounded-lg ${
                  isToday ? "bg-blue-50 border border-blue-200" : "bg-gray-50"
                }`}
              >
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className={`font-medium ${isToday ? "text-blue-600" : "text-gray-700"}`}>
                      {day} {isToday && "(Today)"}
                    </h4>
                    <p className={`${isToday ? "text-blue-700" : "text-gray-600"}`}>{exercise}</p>
                  </div>
                  <div className="text-sm">
                    {exercise === "Biceps" && "3 sets x 12 reps of curls"}
                    {exercise === "Triceps" && "3 sets x 15 reps of extensions"}
                    {exercise === "Chest" && "4 sets x 10 reps of bench press"}
                    {exercise === "Back" && "3 sets x 12 reps of rows"}
                    {exercise === "Shoulders" && "3 sets x 10 reps of presses"}
                    {exercise === "Legs" && "4 sets x 15 reps of squats"}
                    {exercise === "Cardio" && "30 min moderate intensity"}
                    {exercise === "Rest Day" && "Recovery day - stay hydrated"}
                    {exercise === "Core" && "3 sets of 30-second planks"}
                    {exercise === "Full Body" && "Circuit training - all muscle groups"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add new one-time workout section - minimal version */}
      <div className="bg-white p-6 rounded-xl shadow-sm mt-6">
        <h3 className="text-xl font-bold mb-4 text-gray-800">Add One-Time Workout</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Day</label>
            <select
              value={newWorkout.day}
              onChange={(e) => handleDayChange(e.target.value)}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            >
              {Object.keys(weeklyPlan.weekPlan).map((day) => (
                <option key={day} value={day}>
                  {day}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Time</label>
            <input
              type="time"
              value={newWorkout.time}
              onChange={(e) => setNewWorkout({ ...newWorkout, time: e.target.value })}
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Add Exercise field */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Exercise</label>
            <input
              type="text"
              value={newWorkout.exercise || ""}
              onChange={(e) => setNewWorkout({ ...newWorkout, exercise: e.target.value })}
              placeholder="Enter exercise name"
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-600">Duration (min)</label>
            <input
              type="number"
              min="1"
              value={newWorkout.duration}
              onChange={(e) =>
                setNewWorkout({ ...newWorkout, duration: Math.max(1, e.target.valueAsNumber || 1) })
              }
              className="w-full p-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={addWorkoutSchedule}
              disabled={!newWorkout.exercise}
              className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Add One-Time Workout
            </button>
          </div>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          One-time workouts will override your routine for that specific day and time.
        </p>
      </div>
    </div>
  );
};

export default Schedule;