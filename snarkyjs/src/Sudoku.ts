import {
    Field,
    SmartContract,
    state,
    State,
    Struct,
    method,
    Poseidon,
    Circuit,
  } from 'snarkyjs';

  export class Puzzle extends Struct({
    cell: [[Field, Field], [Field, Field]],
  }) {
  }

  export class Sudoku extends SmartContract {
    @state(Puzzle) puzzle = State<Puzzle>();
    @state(Puzzle) solution = State<Puzzle>();

    init() {
        super.init();
    }

    @method initPuzzle(puzzle: Puzzle){
        const currentState = this.puzzle.get();
        this.puzzle.assertEquals(currentState);

        for (let i = 0; i<2; i++){
            for (let j = 0; i<2; i++){
                puzzle.cell[i][j].assertLessThan(10);
                puzzle.cell[i][j].greaterThanOrEqual(0);
            }
        }

        this.puzzle.set(puzzle);
    }


    @method updateSolution(solution: Puzzle) {
      const currentState = this.puzzle.get();
      this.puzzle.assertEquals(currentState);

      for (let i = 0; i<2; i++){
        for (let j = 0; j<2; j++){
            solution.cell[i][j].assertLessThan(10);
            solution.cell[i][j].assertGreaterThan(0);
            let empty_cell = currentState.cell[i][j].equals(Field(0));
            let same = currentState.cell[i][j].equals(solution.cell[i][j]);
            same.or(empty_cell).assertTrue();

            //Check rows
            let cell = solution.cell[i][j].equals(solution.cell[i][j])
            for (let k = 0; k < 2; k++) {
                let temp = solution.cell[i][j].equals(solution.cell[i][k]);
                cell = temp.and(cell);
                }
            cell.assertFalse();
            

            let col = solution.cell[j][i].equals(solution.cell[j][i])
                for (let k = 0; k < 2; k++) {
                    let temp = solution.cell[j][i].equals(solution.cell[k][i]);
                    col = temp.and(col);
                }
            col.assertFalse();        
            }
        }

        this.solution.set(solution);
    }
}
