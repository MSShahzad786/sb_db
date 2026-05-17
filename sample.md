Here is the fully regenerated prompt first, then the 20 MCQs.

---

# REGENERATED PROMPT

```
You are an MCQ generator for university exam preparation.

I will give you:
- Subject code and name
- Exam type (Mid / Final)
- Week range or topic range
- Number of MCQs

Generate MCQs strictly following these rules:

---

QUESTION FORMAT:
- Search online resources, past papers, forums, and exam preparation 
  sites related to the subject to find real and repeated MCQs
- Question text and options can be taken directly from those sources
- 4 options (A, B, C, D)
- No bold, no hints inside options
- Mark correct answer below options as: **Answer: 2** 
  (zero-based index, A=0, B=1, C=2, D=3)
- Mark importance at end of question text ONLY if the question is:
  *(v.v.imp)* for very very important
  *(repeated)* for questions appeared in past papers or frequently repeated
- All other questions get: *(-)* 

---

EXPLANATION FORMAT:

Match the explanation depth and structure to the question type.
Do not use one fixed format for every question.

--- 

TYPE A — Abbreviation or single fact question:
- One line only
- Just state the fact directly

Example:
NeMS = Network Modeling and Simulation

---

TYPE B — Definition question:
- One heading (the term being defined)
- 2 to 3 bullets only
- Each bullet is one core fact

Example:
**Simulation**
- Imitation of real world system behavior
- Runs according to rules defined in the model
- Precedes analysis, follows modeling

---

TYPE C — Concept comparison question:
- Separate heading for each term
- 2 bullets max under each heading
- No cross-referencing between headings

Example:
**Deterministic Model**
- Same input always gives same output
- No randomness involved

**Stochastic Model**
- No unique input-output mapping
- Uses pseudo-random number generators

---

TYPE D — Process or sequence question:
- One heading: Process Flow
- Format: Step N = Name — one line explanation
- No extra sentences

Example:
**Process Flow**
- Step 1 = Modeling — defines rules and structure
- Step 2 = Simulation — executes according to those rules
- Step 3 = Iteration — revisit modeling if result unsatisfactory

---

TYPE E — Calculation question:
- Show step by step working only
- Label each step clearly
- No extra sentences before or after working

---

TYPE F — cause and effect / reason question:
- One heading for the cause
- One heading for the effect
- 2 bullets max under each

---

GENERAL RULES FOR ALL TYPES:
- One fact per bullet only
- No concluding or summarizing sentences
- No filler phrases
- No reference to handout, book, page, or topic number
- No AI-sounding language
- Simple and direct English only
- Never write why other options are wrong
- Never compare terms inside the same paragraph
```

---

# CS432 — Network Modeling and Simulation
## Week 01 | 20 MCQs

---

**Q1.** What does NeMS stand for? *(repeated)*

A. Network Emulation and Monitoring System
B. Network Modeling and Simulation
C. Network Management and Security
D. Network Measurement and Statistics

**Answer: 1**

NeMS = Network Modeling and Simulation

---

**Q2.** Which of the following comes first in the NeMS process? *(v.v.imp)*

A. Simulation
B. Verification
C. Modeling
D. Analysis

**Answer: 2**

**Process Flow**
- Step 1 = Modeling — defines rules and logical structure of the system
- Step 2 = Simulation — executes according to those rules
- Step 3 = Iteration — modeling is revisited if result is unsatisfactory

---

**Q3.** A model where the same input always produces the same output is called: *(v.v.imp)*

A. Stochastic
B. Dynamic
C. Deterministic
D. Continuous

**Answer: 2**

**Deterministic Model**
- Same input always gives same output
- No randomness involved

**Stochastic Model**
- No unique input-output mapping
- Uses pseudo-random number generators

---

**Q4.** Which model type uses pseudo-random number generators? *(repeated)*

A. Deterministic
B. Steady state
C. Linear
D. Stochastic

**Answer: 3**

**Stochastic Model**
- No fixed input-output relationship
- Relies on pseudo-random number generators for execution

---

**Q5.** A model that requires multiple computing platforms is called: *(-)*

A. Linear
B. Closed
C. Distributed
D. Steady state

**Answer: 2**

**Distributed Model**
- Requires multiple computing platforms
- Needs synchronization between platforms

**Local Model**
- Runs on a single platform
- Simpler to implement

---

**Q6.** Which simulation type has no time axis? *(v.v.imp)*

A. Discrete event
B. Trace driven
C. Continuous event
D. Monte Carlo

**Answer: 3**

**Monte Carlo**
- No time axis
- Models probabilistic phenomena that do not change with time

---

**Q7.** In discrete event simulation, what happens between event intervals? *(-)*

A. State variables update continuously
B. No events occur
C. Random numbers are generated
D. Clock resets to zero

**Answer: 1**

**Discrete Event Simulation**
- No events occur between intervals
- Produces finite events and outputs only

---

**Q8.** Which simulator component fast forwards time directly to the next event? *(repeated)*

A. State variable
B. Event driven clock
C. Input routine
D. Report generation routine

**Answer: 1**

**Event Driven Clock**
- Skips idle time
- Jumps directly to the next scheduled event

**Time Driven Clock**
- Moves in constant small increments
- Does not skip idle periods

---

**Q9.** Which routine initializes state variables before simulation begins? *(-)*

A. Input routine
B. Event routine
C. Initialization routine
D. Main program

**Answer: 2**

**Initialization Routine**
- Sets up state variables, global variables, and statistical variables
- Runs before simulation execution begins

---

**Q10.** An underdefined model produces results that are: *(v.v.imp)*

A. Very reliable but slow
B. Simplified but untrustworthy
C. Complex and highly accurate
D. Random and unpredictable

**Answer: 1**

**Underdefined Model**
- Analysis is simplified
- Results are untrustworthy

**Overdefined Model**
- Analysis is complex
- Results are highly reliable but error-prone due to complexity

---

**Q11.** Over reliance on link budget methods for abstraction is categorized as: *(v.v.imp)*

A. General programming mistake
B. Initialization error
C. Simulation inaccuracy
D. Misleading result

**Answer: 2**

**Simulation Inaccuracy**
- Link budget losses are overly static
- Dynamic analysis is not possible using this method

---

**Q12.** Short simulation run times lead to: *(repeated)*

A. Faster convergence to steady state
B. Strong dependence on initial conditions
C. Better randomness in outputs
D. Reduced computational load

**Answer: 1**

**Short Run Times**
- Strong dependence on initial conditions remains
- True steady state is never achieved

---

**Q13.** Wrong seed values in random number generators cause: *(repeated)*

A. Faster simulation
B. Deterministic output
C. Inadvertent correlation between processes
D. Reduced simulation complexity

**Answer: 2**

**Wrong Seed Value**
- Causes inadvertent correlation between independent processes
- Leads to predictable rather than random behavior

---

**Q14.** A model that does not require any external inputs is: *(-)*

A. Open
B. Linear
C. Closed
D. Distributed

**Answer: 2**

**Closed Model**
- Takes no external inputs
- Used in automated systems

**Open Model**
- Requires and defines external inputs

---

**Q15.** The event queue in a simulator determines: *(repeated)*

A. Visual output of simulation
B. Total simulation time and complexity
C. Seed value of random numbers
D. Number of modules in the model

**Answer: 1**

**Event Queue**
- Ordered list of all scheduled events
- Determines simulation complexity and total run time

---

**Q16.** Simulation is best described as: *(v.v.imp)*

A. A logical representation of a system
B. A hardware prototype of a network
C. Computational re-enactment of real world system behavior
D. A mathematical formula for network performance

**Answer: 2**

**Simulation**
- Imitation of real world system behavior
- Runs according to rules defined by the model

---

**Q17.** Overly simplistic modeling of radio layers is described as the: *(-)*

A. Root cause of all simulation errors
B. Achilles heel of network simulation
C. Most common programming mistake
D. Primary initialization problem

**Answer: 1**

**Overly Simplistic Radio Layer Modeling**
- Lowest layer is often ignored
- No bit-level BER or delay is modeled
- Produces wrong results in dynamic use cases

---

**Q18.** Which model type establishes input-output relation at equilibrium? *(-)*

A. Dynamic
B. Distributed
C. Steady state
D. Stochastic

**Answer: 2**

**Steady State Model**
- Establishes input-output relation at equilibrium
- Simpler than dynamic models

**Dynamic Model**
- Integrates internal changes with changing inputs
- More complex

---

**Q19.** Simulation is unnecessary when: *(v.v.imp)*

A. The system is too complex to analyze
B. The analytical model gives good enough representation
C. Prototyping is too expensive
D. Random behavior needs to be studied

**Answer: 1**

**When Not to Simulate**
- Analytical model already gives sufficient results
- Simulation would be expensive or non-scalable
- Simulation takes months with no added benefit

---

**Q20.** Which of the following is NOT listed as a component of a simulator? *(-)*

A. Event queue
B. Simulation clock
C. Hardware emulator
D. Initialization routine

**Answer: 2**

**Simulator Components**
- Event queue, simulation clock, state variables
- Event routines, input routines, report generation routine
- Initialization routine, main program
- Hardware emulator is not part of a simulator