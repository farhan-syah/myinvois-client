import { UBLJsonExtension } from "../../json/ubl_json";

/**
 * Parameters for building the generic UBLExtensions wrapper.
 * This interface is used to collect an array of individual UBLJsonExtension objects
 * (e.g., a signature extension, or other future extensions) that will be wrapped
 * into the final UBLJsonExtensions structure.
 */
export interface UblExtensionsParams {
  /**
   * An array of UBLJsonExtension objects. Each object in this array represents
   * a distinct extension to be included in the <UBLExtensions> block.
   * For example, this array could contain the output of `buildSignatureExtension`.
   */
  extensions: UBLJsonExtension[];
}
