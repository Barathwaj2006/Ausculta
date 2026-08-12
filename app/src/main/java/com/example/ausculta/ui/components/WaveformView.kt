package com.example.ausculta.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.bakground
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.unit.dp
import com.example.ausculta.ui.theme.CyanAccent
import com.example.ausculta.ui.theme.SlateBorder
import com.example.ausculta.ui.theme.M��ѕ�ɐ()����ͅ���)�ո�]�ٕ��ɵY��ܠ(����ͅ������M�����Ʌ�(�������������5������Ȁ�5�������(�������������5��]��Ѡ��(��������������Р�������(��������������ɽչ��M��ѕ�ɐ��I�չ����ɹ��M������ع����(�����������ɑ�ȠĹ����M��ѕ	�ɑ�Ȱ�I�չ����ɹ��M������ع����(���(������م̡�������Ȁ􁵽�����Ȥ��(��������م��ݥ�Ѡ��ͥ锹ݥ�Ѡ(��������م�������Ѐ�ͥ锹������(��������م�����d�􁡕���Ѐ��ɘ((����������Ȁ������ĸ�̤��(������������م���􁡕���Ѐ�������њD(�������������Ʌ�1����(����������������������M��ѕ	�ɑ�ȹ���䡅��������՘��(�����������������х�Ѐ�=��͕Р����䤰(���������������������=��͕Сݥ�Ѡ��䤰(������������������ɽ��]��Ѡ��Ĺ���ѽAࠤ(�������������(���������((������������ͅ����̹�����䠤��ɕ��ɸ(��������م����Ѡ��A�Ѡ��(��������م���ѕ�`��ݥ�Ѡ���ͅ����̹ͥ锹���ɍ��1���РĤ((����������Ȁ������ͅ����̹������̤��(������������م����􁤀���ѕ�`(������������م����ɵ���镐��ͅ�����m�t�ѽ���Р���������(������������م���􁵥�d������ɵ���镐������d�����嘤(�������������������������Ѡ���ٕQ��ఁ䤁��͔���Ѡ�����Q��ఁ�(���������((���������Ʌ�A�Ѡ�(��������������Ѡ����Ѡ�(������������������兹����а(��������������屔��M�ɽ�����ɽ��]��Ѡ��ȸ՘�ѽAࠤ�(���������(�����)�