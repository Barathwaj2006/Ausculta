package com.example.ausculta.ui.components

import androidx.compose.foundation.bakground
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.example.ausculta.model.DeviceConnectionState
import com.example.ausculta.ui.theme.*J
@Composable
fun DeviceStatusCard(
    state: DeviceConnectionState,
    onConnectSimulator: () -> Unit,
    onDisconnect: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, SlateBorder, RoundedCornerShape(16.dp)),
        colors = CardDefaults.cardColors(containerColor0= SlateCard)
    ) {
        Row(
            modifier = Modifier.padding(16.dp),
            verticalAlignment = Alignment.CenterVertical
        ) {
            Box(
                modifier = Modifier
                    .size(12.dp)
                    .background(
                        when (state) {
                            is DeviceConnectionState.Connected -> EmeralGy�^�ɕ��(�����������������������������́�٥�������ѥ��Mхє������ѥ�����́�٥�������ѥ��Mхє�M�����������兹�����(������������������������������͔����Aձ͕I��(��������������������������(������������������������I�չ����ɹ��M�����ع���(���������������������(�������������(������������M����ȡ5������ȹݥ�Ѡ��ȹ����(��������������յ���������Ȁ�5������ȹݕ���РŘ����(����������������Q��Р(��������������������ѕ�Ѐ�ݡ�����хє���(�������������������������́�٥�������ѥ��Mхє������ѕ������хє���٥��9���(�������������������������́�٥�������ѥ��Mхє������ѥ������������ѥ���Ѽ����хє���٥��9��������(�������������������������́�٥�������ѥ��Mхє�M������������M����������ȁM@�ȁMѕѡ�͍�������(��������������������������͔������͍�����ѕ��(����������������������(������������������������]����Ѐ����]����й	����(������������������������Ȁ�Q���Aɥ����(�����������������(����������������Q��Р(��������������������ѕ�Ѐ�ݡ�����хє���(�������������������������́�٥�������ѥ��Mхє������ѕ�����������хє���M��ձ�ѽȤ�����ѥ��M��ձ�ѽȁ�ѥٔ���͔�	1������ѕ������хє����ѕ��A�ɍ��х������(��������������������������͔�����I����Ѽ����ȁM@�ȁ��ɑ݅ɔ�(����������������������(������������������������M�销��ȹ���(������������������������Ȁ�Q���M��������(�����������������(�������������(�����������������хє��́�٥�������ѥ��Mхє������ѕ����(����������������=�ѱ����	��ѽ��(���������������������������􁽹�͍�����а(�������������������������̀�	��ѽ����ձ�̹��ѱ����	��ѽ�����̡���ѕ�����Ȁ�Aձ͕I���(�������������������(�������������������Q��Р��͍�����Ј�(�����������������(������������􁕱͔��(����������������	��ѽ��(���������������������������􁽹������M��ձ�ѽȰ(�������������������������̀�	��ѽ����ձ�̹���ѽ�����̡���х�����������兹����а����ѕ�����Ȁ�M��ѕ�ɬ�(�������������������(��������������������Q��Р�Mх�ЁM��ձ�ѽȈ�(�����������������(�������������(���������(�����)�(