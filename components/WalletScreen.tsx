// This file acts as a re-exporter to resolve module resolution issues.
// It re-exports WalletTabScreen which is likely what was intended.
import WalletTabScreen from './WalletTabScreen';

export { WalletTabScreen as WalletScreen };
export default WalletTabScreen;