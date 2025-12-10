import { Text as RNText, TextProps } from "react-native";

interface Props extends TextProps {}

export function Text(props: Props) {
  return <RNText {...props} allowFontScaling={false} />;
}