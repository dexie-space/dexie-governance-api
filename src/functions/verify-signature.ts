import { AugSchemeMPL, JacobianPoint } from 'chia-bls';
import { Program } from 'clvm-lib';

const CHIP_0002_SIGN_MESSAGE_PREFIX = 'Chia Signed Message';

const P2_DELEGATED_OR_HIDDEN =
  'ff02ffff01ff02ffff03ff0bffff01ff02ffff03ffff09ff05ffff1dff0bffff1effff0bff0bffff02ff06ffff04ff02ffff04ff17ff8080808080808080ffff01ff02ff17ff2f80ffff01ff088080ff0180ffff01ff04ffff04ff04ffff04ff05ffff04ffff02ff06ffff04ff02ffff04ff17ff80808080ff80808080ffff02ff17ff2f808080ff0180ffff04ffff01ff32ff02ffff03ffff07ff0580ffff01ff0bffff0102ffff02ff06ffff04ff02ffff04ff09ff80808080ffff02ff06ffff04ff02ffff04ff0dff8080808080ffff01ff0bffff0101ff058080ff0180ff018080';

export function verifySignature(pubkey: string, message: string, signature: string, ph?: string): boolean {
  try {
    const prg = Program.cons(Program.fromText(CHIP_0002_SIGN_MESSAGE_PREFIX), Program.fromText(message));

    // verify that pubkey matches the corresponding address (ph)
    if (ph) {
      const public_key_prg = Program.fromHex(pubkey);
      const puzzle_hash = Program.deserializeHex(P2_DELEGATED_OR_HIDDEN).curry([public_key_prg]).hashHex();

      if (puzzle_hash !== ph) {
        return false;
      }
    }

    return AugSchemeMPL.verify(JacobianPoint.fromHexG1(pubkey), prg.hash(), JacobianPoint.fromHexG2(signature));
  } catch (err) {
    console.error(err);
    return false;
  }
}
